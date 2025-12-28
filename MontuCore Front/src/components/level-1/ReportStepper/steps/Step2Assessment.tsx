import type { UseFormReturn } from "react-hook-form";
import TextInput from "../../../level-0/TextInput/TextInput";
import ComboBox from "../../../level-0/ComboBox/ComboBox";
import styles from "./Steps.module.css";
import { INJURY_TYPES, SEVERITY } from "../constants/symptoms";
import { useAllClinicians } from "../../../../hooks/useUsers";

interface Step2AssessmentProps {
  form: UseFormReturn<any>;
}

export default function Step2Assessment({ form }: Step2AssessmentProps) {
  const { watch, setValue, formState: { errors } } = form;
  const severity = watch("severity") || "";
  
  const { data: clinicians, isLoading } = useAllClinicians();

  const physiotherapistOptions = [
    { 
      label: isLoading ? "Loading Clinicians..." : "Select Physiotherapist", 
      value: "" 
    },
    ...(clinicians
      ?.filter((c) => c.clinicianProfile?.specialty === "Physiotherapist") 
      ?.map((c) => ({ 
        label: `Dr. ${c.fullName}`, 
        value: String(c.id) 
      })) || [])
  ];

  const injuryTypeOptions = [
    { label: "Please choose an injury type", value: "" },
    ...INJURY_TYPES.map((type) => ({ label: type, value: type }))
  ];

  return (
    <div className={styles.stepContainer}>
      <h3 className={styles.stepTitle}>Assessment</h3>

      <div className={styles.formGroup}>
        <TextInput
          label="Diagnosis"
          value={watch("diagnosis") || ""}
          placeholder="Enter diagnosis"
          onChange={(val) => setValue("diagnosis", val, { shouldValidate: true })}
          error={errors.diagnosis?.message as string}
        />
      </div>

      <div className={styles.formGroup}>
        <ComboBox
          label="Suspected Injury Type"
          options={injuryTypeOptions}
          value={watch("injuryType") || ""}
          onChange={(val) => setValue("injuryType", val, { shouldValidate: true })}
        />
        {errors.injuryType && <span className={styles.error}>{errors.injuryType.message as string}</span>}
      </div>

      <div className={styles.formGroup}>
        <ComboBox
          label="Physiotherapist"
          options={physiotherapistOptions}
          value={watch("physiotherapistProgram") || ""}
          onChange={(val) => setValue("physiotherapistProgram", val, { shouldValidate: true })}
        />
        {errors.physiotherapistProgram && <span className={styles.error}>{errors.physiotherapistProgram.message as string}</span>}
      </div>

      <div className={styles.formGroup}>
        <TextInput
          label="Follow-up Date"
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={watch("followUpDate") || ""}
          onChange={(val) => setValue("followUpDate", val || undefined, { shouldValidate: true })}
          error={errors.followUpDate?.message as string}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Severity</label>
        <div className={styles.severityGrid}>
          {SEVERITY.map((level) => (
            <div
              key={level}
              className={`${styles.severityOption} ${severity === level ? styles.selected : ""}`}
              data-severity={level}
              onClick={() => setValue("severity", level, { shouldValidate: true })}
            >
              <input
                type="radio"
                name="severity"
                value={level}
                checked={severity === level}
                className={styles.severityRadio}
                readOnly
              />
              <span className={styles.severityLabel}>
                {level.charAt(0) + level.slice(1).toLowerCase()}
              </span>
            </div>
          ))}
        </div>
        {errors.severity && <span className={styles.error}>{errors.severity.message as string}</span>}
      </div>
    </div>
  );
}