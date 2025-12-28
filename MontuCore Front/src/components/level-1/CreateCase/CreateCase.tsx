import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router"; 
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
}

export default function CreateCase({ isOpen, onClose, initialAthlete }: CreateCaseProps) {
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

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

  const onSubmit = (data: CreateCaseFormData) => {
    if (data.isNewCase === "yes") {
      onClose();
      navigate({ 
        to: "/cases/$caseId", 
        params: { caseId: String(initialAthlete.id) } 
      });
    } else {
      setSuccessMsg(`Notes saved for ${initialAthlete.fullName}`);
      setTimeout(() => {
        reset();
        setSuccessMsg("");
        onClose();
      }, 1200);
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
              <Button type="button" variant="secondary" onClick={onClose} height="36px">Cancel</Button>
              <Button type="submit" height="36px">
                {isNewCase === "yes" ? "Continue" : "Save Entry"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}