import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router"; 
import { useAuth } from "../../../context/AuthContext";
import styles from "./CreateCase.module.css";
import Button from "../../level-0/Button/Bottom";
import TextInput from "../../level-0/TextInput/TextInput";
import RadioButton from "../../level-0/RadioButton/RadioButton";

const CreateCaseSchema = z.object({
  isNewCase: z.enum(["yes", "no"]),
  height: z.string().optional(),
  weight: z.string().optional(),
  diagnosisNotes: z.string().optional(),
}).refine((data) => {
  if (data.isNewCase === "no") {
    return !!data.height && !!data.weight && !!data.diagnosisNotes;
  }
  return true;
}, {
  message: "Clinical details are required",
  path: ["diagnosisNotes"], 
});

type CreateCaseFormData = z.infer<typeof CreateCaseSchema>;

interface CreateCaseProps {
  isOpen: boolean;
  onClose: () => void;
  initialAthlete: { id: string | number; fullName: string };
  appointmentId: number;
}

export default function CreateCase({ isOpen, onClose, initialAthlete, appointmentId }: CreateCaseProps) {
  const [successMsg, setSuccessMsg] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const { control, handleSubmit, watch, formState: { errors }, reset } = useForm<CreateCaseFormData>({
    resolver: zodResolver(CreateCaseSchema),
    defaultValues: {
      isNewCase: "yes",
      height: "",
      weight: "",
      diagnosisNotes: ""
    },
  });

  const isNewCase = watch("isNewCase");

  const onSubmit = async (data: CreateCaseFormData) => {
    if (data.isNewCase === "yes") {
      if (!user || !profile) {
        alert("User authentication required");
        return;
      }

      if (!appointmentId) {
        alert("Appointment context required to create a case");
        return;
      }

      setIsCreating(true);
      try {
        const caseData = {
          athleteId: Number(initialAthlete.id),
          managingClinicianId: profile.id, // clinician profile ID
          initialAppointmentId: appointmentId, // required appointment ID
          diagnosisName: "none",
          icd10Code: "S83.5",
          injuryDate: new Date().toISOString(),
          status: "ACTIVE",
          severity: "MODERATE",
          medicalGrade: "Grade 2"
        };

        const response = await fetch('http://localhost:3000/api/cases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(caseData),
        });

        if (!response.ok) {
          throw new Error('Failed to create case');
        }

        const result = await response.json();
        const newCaseId = result.data?.id || result.id;

        onClose();
        navigate({ 
          to: `/cases/${newCaseId}`
        });
      } catch (error) {
        console.error('Error creating case:', error);
        alert('Failed to create case. Please try again.');
      } finally {
        setIsCreating(false);
      }
    } else {
      // Add Notes Only - Update appointment with clinical details
      setIsCreating(true);
      try {
        const appointmentData = {
          height: data.height ? parseFloat(data.height) : undefined,
          weight: data.weight ? parseFloat(data.weight) : undefined,
          diagnosisNotes: data.diagnosisNotes || "",
          status: "COMPLETED"
        };

        const response = await fetch(`http://localhost:3000/api/appointments/update-appointment-details/${appointmentId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appointmentData),
        });

        if (!response.ok) {
          throw new Error('Failed to update appointment');
        }

        setSuccessMsg(`Clinical notes saved and appointment completed for ${initialAthlete.fullName}`);
        setTimeout(() => {
          reset();
          setSuccessMsg("");
          onClose();
        }, 2000);
      } catch (error) {
        console.error('Error updating appointment:', error);
        alert('Failed to save clinical notes. Please try again.');
      } finally {
        setIsCreating(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <h2 className={styles.title}>Clinical Entry</h2>
            <p className={styles.subtitle}>Patient: <strong>{initialAthlete?.fullName}</strong></p>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {successMsg ? (
          <div className={styles.successMsg}>{successMsg}</div>
        ) : (
          <form className={styles.formContent} onSubmit={handleSubmit(onSubmit)}>
            
            <div className={styles.toggleContainer}>
              <div className={styles.radioWrapper}>
                <Controller
                  name="isNewCase"
                  control={control}
                  render={({ field }) => (
                    <>
                      <RadioButton 
                        label="Create Case"
                        name="caseToggle"
                        value="yes"
                        checked={field.value === "yes"}
                        onChange={() => field.onChange("yes")}
                      />
                      <RadioButton 
                        label="Add Notes Only"
                        name="caseToggle"
                        value="no"
                        checked={field.value === "no"}
                        onChange={() => field.onChange("no")}
                      />
                    </>
                  )}
                />
              </div>
            </div>

            {isNewCase === "no" && (
              <div className={styles.notesSection}>
                <div className={styles.metricsRow}>
                   <Controller
                    name="height"
                    control={control}
                    render={({ field }) => (
                      <TextInput 
                        label="Height (cm)" 
                        placeholder="185"
                        value={field.value ?? ""} 
                        onChange={field.onChange} 
                        error={errors.height?.message}
                      />
                    )}
                  />
                   <Controller
                    name="weight"
                    control={control}
                    render={({ field }) => (
                      <TextInput 
                        label="Weight (kg)" 
                        placeholder="82"
                        value={field.value ?? ""} 
                        onChange={field.onChange} 
                        error={errors.weight?.message}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="diagnosisNotes"
                  control={control}
                  render={({ field }) => (
                    <TextInput 
                      label="Diagnosis & Assessment" 
                      placeholder="Physical examination results..."
                      value={field.value ?? ""} 
                      onChange={field.onChange} 
                      error={errors.diagnosisNotes?.message}
                      height="5.5rem" 
                    />
                  )}
                />
              </div>
            )}

            <div className={styles.actions}>
              <Button type="button" variant="secondary" onClick={onClose} height="36px" disabled={isCreating}>Cancel</Button>
              <Button type="submit" height="36px" disabled={isCreating}>
                {isCreating ? "Saving..." : (isNewCase === "yes" ? "Continue" : "Save Entry")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}