import { useFieldArray, type UseFormReturn } from "react-hook-form";
import Button from "../../../level-0/Button/Bottom";
import TreatmentDetail from "../../../level-2/DetailsOverlay/TreatmentOverlay";
import type { TreatmentData } from "../../../level-2/DetailsOverlay/TreatmentOverlay";

import styles from "./Steps.module.css";

interface Step4TreatmentProps {
  form: UseFormReturn<any>;
}

export default function Step4Treatment({ form }: Step4TreatmentProps) {
  const { control, watch, setValue, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "treatment",
  });

  const treatments = watch("treatment") || [];
  const treatmentErrors = errors.treatment as any;

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 className={styles.stepTitle} style={{ margin: 0 }}>Treatment Plan</h3>
        <Button 
          type="button" 
          variant="primary" 
          onClick={() => append({ 
            type: "Medication", 
            description: "", 
            providerName: "", 
            date: new Date().toISOString().split("T")[0], 
            cost: 0 
          })}
        >
          + Add Treatment
        </Button>
      </div>

      {/* This container will handle the scrolling */}
      <div className={styles.scrollableContent}>
        {fields.map((field, index) => (
          <div key={field.id} className={styles.treatmentItemWrapper}>
            <div className={styles.examHeader}>
              <span className={styles.examNumber}>Treatment #{index + 1}</span>
              {fields.length > 1 && (
                <span 
                  className={styles.removeBtn} 
                  onClick={() => remove(index)}
                >
                  ×
                </span>
              )}
            </div>

            <div className={styles.forceInline}>
              <TreatmentDetail
                isOpen={true} 
                onClose={() => {}} 
                isTakingInput={true}
                treatmentData={treatments[index]}
                setTreatmentData={(data: TreatmentData) => {
                  setValue(`treatment.${index}`, data);
                }}
              />
            </div>
            
            {treatmentErrors?.[index] && (
              <p className={styles.error}>Please complete all fields for this treatment.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}