import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { type FullReport } from '../components/level-1/ReportStepper/schemas/fullReport';
import { bookAppointmentApi } from './useAppointments';

export interface SubmitReportParams {
    data: FullReport;
    appointmentId: number;
    athleteId: number;
    clinicianId: number;
    existingCaseId?: number;
}

export const useMedicalReport = () => {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

    return useMutation({
        mutationFn: async ({ data, appointmentId, athleteId, clinicianId, existingCaseId }: SubmitReportParams) => {
            console.log("[useMedicalReport] Starting mutation with params:", { appointmentId, athleteId, clinicianId, existingCaseId });
            
            if (!token) {
                console.error("[useMedicalReport] No auth token available");
                throw new Error("Authentication required");
            }
            
            if (!data) {
                console.error("[useMedicalReport] Mutation failed: 'data' is undefined", { appointmentId, athleteId });
                throw new Error("Report data is missing");
            }

            console.log("[useMedicalReport] Report data received:", data);

            // --- 1. Update Appointment Notes ---
            console.log("[useMedicalReport] Step 1: Updating appointment notes");
            const symptomsStr = Array.isArray(data.symptoms) ? data.symptoms.join(" - ") : "";
            console.log("[useMedicalReport] Symptoms string:", symptomsStr);
            
            const notesPayload = {
                symptoms: symptomsStr,
                Notes: data.Notes || "", 
                painLevel: data.painLevel,
            };
            console.log("[useMedicalReport] Notes payload:", notesPayload);
            
            const apptResponse = await fetch(`${API_URL}/appointments/update-appointment-details/${appointmentId}`, { 
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ 
                        id: appointmentId,
                        diagnosisNotes: JSON.stringify(notesPayload) 
                }),
            });

            console.log("[useMedicalReport] Appointment update response status:", apptResponse.status);
            if (!apptResponse.ok) {
                console.warn("[useMedicalReport] Failed to update appointment notes (status:", apptResponse.status, "). Proceeding with Case...");
            } else {
                console.log("[useMedicalReport] Appointment notes updated successfully");
            }

            // --- 2. Create or Update Case ---
            console.log("[useMedicalReport] Step 2: Processing case");
            let caseId = existingCaseId;
            console.log("[useMedicalReport] Initial caseId:", caseId);
            
            const casePayload = {
                diagnosisName: `${data.diagnosis} - ${data.injuryType || ''}`,
                severity: data.severity,
                status: data.caseStatus === "recovered" ? "RECOVERED" : "ACTIVE",
                medicalGrade: `Pain Level: ${data.painLevel || 'N/A'}`,
            };
            console.log("[useMedicalReport] Case payload:", casePayload);

            if (caseId) {
                console.log("[useMedicalReport] Updating existing case:", caseId);
                const response = await fetch(`${API_URL}/cases/${caseId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify(casePayload),
                });
                console.log("[useMedicalReport] Case update response status:", response.status);
                if (!response.ok) {
                    console.error("[useMedicalReport] Failed to update case");
                    throw new Error("Failed to update case");
                }
                console.log("[useMedicalReport] Case updated successfully");
            } else {
                console.log("[useMedicalReport] Creating new case");
                 const response = await fetch(`${API_URL}/cases`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        ...casePayload,
                        athleteId,
                        managingClinicianId: clinicianId,
                        initialAppointmentId: appointmentId,
                        injuryDate: new Date().toISOString(),
                    }),
                });
                console.log("[useMedicalReport] Case creation response status:", response.status);
                if (!response.ok) {
                    console.error("[useMedicalReport] Failed to create case");
                    throw new Error("Failed to create case");
                }
                const newCase = await response.json();
                console.log("[useMedicalReport] New case created:", newCase);
                caseId = newCase.id;
                console.log("[useMedicalReport] Assigned caseId:", caseId);
            }

            if (!caseId) {
                console.error("[useMedicalReport] Case ID could not be determined");
                throw new Error("Case ID could not be determined");
            }

            // --- 3. Create Rehab Program ---
            console.log("[useMedicalReport] Step 3: Processing rehab program");
            console.log("[useMedicalReport] Rehab program value:", data.rehabProgram);
            if (data.rehabProgram && data.rehabProgram !== "None") {
                console.log("[useMedicalReport] Creating physio program:", data.rehabProgram);
                await fetch(`${API_URL}/physio-programs`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        caseId,
                        title: data.rehabProgram,
                        numberOfSessions: 10,
                        startDate: new Date().toISOString(),
                    }),
                }).then(r => {
                    console.log("[useMedicalReport] Physio program response status:", r.status);
                    return r;
                }).catch(e => console.error("[useMedicalReport] Failed to create physio program:", e));
            } else {
                console.log("[useMedicalReport] No rehab program specified");
            }

            // --- 4. Create Exams (Pending/Ordered) ---
            console.log("[useMedicalReport] Step 4: Processing exams");
            console.log("[useMedicalReport] Exams data:", data.exam);
            if (data.exam && data.exam.length > 0) {
                console.log("[useMedicalReport] Creating", data.exam.length, "exam(s)");
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                console.log("[useMedicalReport] Scheduled exam date:", nextWeek.toISOString());

                await Promise.all(data.exam.map((exam, idx) => {
                    console.log(`[useMedicalReport] Creating exam ${idx + 1}:`, exam);
                    return fetch(`${API_URL}/exams`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                            caseId: caseId,
                            modality: Array.isArray(exam.modality) ? exam.modality[0] : exam.modality,
                            bodyPart: exam.bodyPart,
                            status: "ORDERED", 
                            scheduledAt: nextWeek.toISOString(),
                        }),
                    }).then(r => {
                        console.log(`[useMedicalReport] Exam ${idx + 1} response status:`, r.status);
                        return r;
                    });
                }));
                console.log("[useMedicalReport] All exams created successfully");
            } else {
                console.log("[useMedicalReport] No exams to create");
            }

            // --- 5. Create Treatments ---
            console.log("[useMedicalReport] Step 5: Processing treatments");
            console.log("[useMedicalReport] Treatments data:", data.treatment);
            if (data.treatment && data.treatment.length > 0) {
                console.log("[useMedicalReport] Creating", data.treatment.length, "treatment(s)");
                await Promise.all(data.treatment.map((treatment, idx) => {
                    console.log(`[useMedicalReport] Creating treatment ${idx + 1}:`, treatment);
                    return fetch(`${API_URL}/treatments`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                            caseId,
                            type: treatment.type,
                            description: treatment.description,
                            providerName: treatment.providerName,
                            cost: Number(treatment.cost),
                            date: treatment.date ? new Date(treatment.date).toISOString() : new Date().toISOString(),
                        }),
                    }).then(r => {
                        console.log(`[useMedicalReport] Treatment ${idx + 1} response status:`, r.status);
                        return r;
                    });
                }));
                console.log("[useMedicalReport] All treatments created successfully");
            } else {
                console.log("[useMedicalReport] No treatments to create");
            }

            // --- 6. Book Follow-up Appointment ---
            console.log("[useMedicalReport] Step 6: Processing follow-up appointment");
            console.log("[useMedicalReport] Follow-up date:", data.followUpDate);
            if (data.followUpDate) {
                console.log("[useMedicalReport] Booking follow-up appointment for:", new Date(data.followUpDate).toISOString());
                await bookAppointmentApi({
                    athleteId,
                    clinicianId,
                    scheduledAt: new Date(data.followUpDate).toISOString(),
                    status: "SCHEDULED",
                }, token);
                console.log("[useMedicalReport] Follow-up appointment booked successfully");
            } else {
                console.log("[useMedicalReport] No follow-up date specified");
            }

            console.log("[useMedicalReport] Mutation completed successfully. CaseId:", caseId);
            return { caseId };
        },
        onSuccess: () => {
            console.log("[useMedicalReport] onSuccess: Invalidating queries");
            queryClient.invalidateQueries({ queryKey: ['cases'] });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['exams'] }); 
            queryClient.invalidateQueries({ queryKey: ['treatments'] });
            console.log("[useMedicalReport] Medical Report successfully submitted.");
        },
        onError: (error) => {
            console.error("[useMedicalReport] onError: Error submitting medical report:", error);
        }
    });
};