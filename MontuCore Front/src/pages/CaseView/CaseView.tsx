import { useState } from "react";
import styles from "./CaseView.module.css";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import Button from "../../components/level-0/Button/Bottom";
import ReportStepper from "../../components/level-1/ReportStepper/ReportStepper";

import InfoCard from "../../components/level-0/InfoCard/InfoCard";
import { BodyComponent } from "@darshanpatel2608/human-body-react";

import Bill from "../../components/level-1/bill/bill";
import { useCaseRecord } from "../../hooks/useCaseRecord";
import Badge from "../../components/level-0/Badge/Badge";
import List from "../../components/level-0/List/List";
import { useNavigate } from "@tanstack/react-router";

// Imports for Overlays and Types
import AppointmentOverlay from "../../components/level-2/DetailsOverlay/AppointmentOverlay";
import TreatmentDetail, { type TreatmentData } from "../../components/level-2/DetailsOverlay/TreatmentOverlay";
import { type Appointment, type Treatment } from "../../types/models";
import { useAuth } from "../../context/AuthContext";

function CaseView() {
  const caseId = 2;
  const navigate = useNavigate();
  const { user } = useAuth(); // Access user from AuthContext
  
  const [isReporting, setIsReporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "images">("overview");
  const { caseRecord, isLoading: caseLoading } = useCaseRecord(caseId);

  // --- Overlay State ---
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentOverlay, setShowAppointmentOverlay] = useState(false);

  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentData | undefined>(undefined);
  const [showTreatmentOverlay, setShowTreatmentOverlay] = useState(false);

  const [bodyParts, setBodyParts] = useState<any>({});

  // --- Mock Appointments Data (Full Objects) ---
  const appointmentsData: Appointment[] = [
    { 
      id: 1, 
      athleteId: 29,
      clinicianId: 101,
      scheduledAt: "2025-01-05T09:00:00Z", 
      status: "COMPLETED",
      clinician: { id: 101, fullName: "Dr. Smith", email: "smith@clinic.com" },
      athlete: { id: 29, fullName: "Marco Reus", email: "marco@bvb.de" },
      diagnosisNotes: "Routine checkup completed. Recovery on track."
    },
    { 
      id: 2, 
      athleteId: 29,
      clinicianId: 102,
      scheduledAt: "2025-01-18T14:30:00Z", 
      status: "CANCELLED",
      clinician: { id: 102, fullName: "Dr. Jones", email: "jones@clinic.com" },
      athlete: { id: 29, fullName: "Marco Reus", email: "marco@bvb.de" }
    },
    { 
      id: 3, 
      athleteId: 29,
      clinicianId: 103,
      scheduledAt: "2025-01-25T10:00:00Z", 
      status: "SCHEDULED",
      clinician: { id: 103, fullName: "Dr. Taylor", email: "taylor@clinic.com" },
      athlete: { id: 29, fullName: "Marco Reus", email: "marco@bvb.de" },
      diagnosisNotes: "Scheduled for MRI review."
    },
  ];

  const renderBodyComponent = () => {
    if (caseRecord?.exams) {
      const updatedParts: any = {
          head: { show: true, selected: false },
          chest: { show: true, selected: false },
          stomach: { show: true, selected: false },
          left_shoulder: { show: true, selected: false },
          right_shoulder: { show: true, selected: false },
          left_arm: { show: true, selected: false },
          right_arm: { show: true, selected: false },
          left_hand: { show: true, selected: false },
          right_hand: { show: true, selected: false },
          left_leg_upper: { show: true, selected: false },
          right_leg_upper: { show: true, selected: false },
          left_leg_lower: { show: true, selected: false },
          right_leg_lower: { show: true, selected: false },
          left_foot: { show: true, selected: false },
          right_foot: { show: true, selected: false },
      };

      caseRecord.exams.forEach((exam: any) => {
        const rawPart = exam.bodyPart.toLowerCase().trim();
        let partKey = "";

        if (rawPart.includes("head") || rawPart.includes("skull")) partKey = "head";
          else if (rawPart.includes("chest") || rawPart.includes("thorax")) partKey = "chest";
          else if (rawPart.includes("shoulder")) partKey = "left_shoulder"; 
          else if (rawPart.includes("hand")) partKey = "left_hand";
          else if (rawPart.includes("foot") || rawPart.includes("ankle")) partKey = "left_foot";
          else if (rawPart.includes("knee") || rawPart.includes("leg")) partKey = "left_leg_upper";
          else if (rawPart.includes("arm")) partKey = "left_arm";
          else {
            partKey = rawPart.replace(" ", "_");
          }

        if (partKey && updatedParts[partKey]) {
          updatedParts[partKey] = { 
            ...updatedParts[partKey], 
            selected: true,
             };
        }
      });

      return <BodyComponent 
               height="75%"
               mode="pain"
               onClick={(id: string) => {
                 console.log(id);
               }}
               partsInput={updatedParts} 
             />
    } 
  }
 
  // Prepare Treatments Data
  const treatmentsList = caseRecord?.treatments || [];
  const treatmentsRows = treatmentsList.map((treatment: Treatment, indx: number) => [
    indx + 1,
    treatment.type,
    new Date(treatment.date).toLocaleDateString(),
    treatment.providerName
  ]);

  const exams = caseRecord?.exams.map((exam , indx)=>[
    indx+1,
    `${exam.bodyPart}-${exam.modality}`,
    <Badge label={exam.status == "IMAGING_COMPLETE"? "Completed" : "pending"} variant={exam.status == "IMAGING_COMPLETE"? "success" : "pending"}/>
  ]);
  
  const physioProgram = caseRecord?.physioPrograms.at(-1);
  
  return (
    <div className={styles.caseView}>
      <div className={styles.overview}>
        <div className={styles.tabButtons}>
          <Button
            variant="secondary"
            onClick={() => setActiveTab("overview")}
            className={styles.tabButton}
          >
            overview
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveTab("images")}
            className={styles.tabButton}
          >
            Images
          </Button>
        </div>
        {activeTab === "overview" && (
          renderBodyComponent()
        )}

        {activeTab === "images" && (
          <div className={styles.imagesList}>
            <List 
              onRowClick={()=>navigate({ to: "/dicom" })}
              header={["#", "Modality", "Body Part", "Date", "Status"]} 
              data={caseRecord?.exams.map((exam) => [
                `#${exam.id}`,
                exam.modality,
                exam.bodyPart,
                new Date(exam.performedAt || exam.scheduledAt).toLocaleDateString(),
                <Badge 
                  label={exam.status === "IMAGING_COMPLETE" ? "Completed" : "Pending"} 
                  variant={exam.status === "IMAGING_COMPLETE" ? "success" : "pending"} 
                />
              ]) || []} 
              gridTemplateColumns=".5fr 1fr 1fr 1.5fr 1.2fr"
            />
          </div>
        )}
        <p className={styles.title}>
          case #{caseId} <span>{caseRecord?.managingClinician.fullName}</span>
        </p>
      </div>

      <div className={styles.reports}>
        <AdjustableCard title="Appointments" maxHeight="100%">
          <List
            header={["#", "Clinician", "Date", "Status"]}
            data={appointmentsData.map(app => [
              app.id, 
              app.clinician?.fullName, 
              new Date(app.scheduledAt).toLocaleDateString(), 
              <Badge 
                label={app.status === "COMPLETED" ? "Completed" : app.status === "CANCELLED" ? "Cancelled" : "Scheduled"} 
                variant={app.status === "COMPLETED" ? "success" : app.status === "CANCELLED" ? "warning" : "pending"} 
              />
            ])}
            gridTemplateColumns="1fr 2fr 2fr 1.1fr"
            // Click Handler for Appointments
            onRowClick={(index) => {
              setSelectedAppointment(appointmentsData[index]);
              setShowAppointmentOverlay(true);
            }} 
          />
        </AdjustableCard>
      </div>

      <div className={styles.treatments}>
        <AdjustableCard title="Treatments" maxHeight="100%" maxWidth="100%">
          <List 
            header={["#","treatment","date","provider"]} 
            data={treatmentsRows} 
            gridTemplateColumns=".2fr 1fr 1fr 1fr"
            // Click Handler for Treatments
            onRowClick={(index) => {
              // Convert model Treatment to TreatmentData if necessary, or just pass if compatible
              const t = treatmentsList[index];
              setSelectedTreatment({
                id: t.id,
                type: t.type,
                description: t.description,
                providerName: t.providerName,
                date: t.date,
                cost: t.cost
              });
              setShowTreatmentOverlay(true);
            }}
          />
        </AdjustableCard>
      </div>

      <div className={styles.physiotherapy}>
        <AdjustableCard title="Physiotherapy" height="100%" maxWidth="100%">
          <div className={styles.physioContent}>
            <div className={styles.physioCards}>
              <InfoCard label="Sessions" value={physioProgram?.numberOfSessions } />
              <InfoCard label="Completed" value={physioProgram?.sessionsCompleted} />
              <InfoCard label="per week" value={physioProgram?.weeklyRepetition} />
            </div>
            <p>
              {physioProgram?.title} 
            </p>
          </div>
        </AdjustableCard>
      </div>

      <div className={styles.buttons}>
        {/* Role-Based Button Rendering */}
        {user ? (
          user.role === 'ATHLETE' ? (
            // Athlete View: Only Bill
            <Bill invoiceId={caseId} />
          ) : (
            // Clinician/Admin View: Add Report, Consult, and Bill
            <>
              <Button 
                variant="secondary" 
                width="75%" 
                className={styles.addbutton}
                onClick={() => setIsReporting(true)}
              >
                Add report
              </Button>
              <Button 
                variant="secondary" 
                width="20%" 
                className={styles.addbutton}
                onClick={() => navigate({ to: "/physician/consult" })}
              >
                consult
              </Button>
              <Bill invoiceId={caseId} /> 
            </>
          )
        ) : null /* Undefined user: No buttons */}
      </div>

      {/* --- Overlays --- */}
      
      <ReportStepper
        isOpen={isReporting}
        onClose={() => setIsReporting(false)}
        caseId={18}
        clinicianId={1}
        athleteId={29}
        appointmentId={30}
      />

      <AppointmentOverlay 
        isOpen={showAppointmentOverlay}
        onClose={() => setShowAppointmentOverlay(false)}
        appointment={selectedAppointment}
      />

      <TreatmentDetail
        isOpen={showTreatmentOverlay}
        onClose={() => setShowTreatmentOverlay(false)}
        treatmentData={selectedTreatment}
      />

    </div>
  );
}

export default CaseView;