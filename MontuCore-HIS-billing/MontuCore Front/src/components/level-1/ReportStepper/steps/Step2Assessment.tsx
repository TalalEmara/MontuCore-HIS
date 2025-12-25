import type { UseFormReturn } from "react-hook-form";
import TextInput from "../../../level-0/TextInput/TextInput";
import ComboBox from "../../../level-0/ComboBox/ComboBox";
import styles from "./Steps.module.css";
import { INJURY_TYPES, IMAGING_OPTIONS } from "../constants/symptoms";

interface Step3AssessmentProps {
  form: UseFormReturn<any>;
}

export default function Step3Assessment({ form }: Step3AssessmentProps) {
  const { watch, setValue, formState: { errors } } = form;
  const selectedImaging = watch("recommendedImaging") || [];

  const handleImagingChange = (imaging: string, checked: boolean) => {
    if (checked) {
      setValue("recommendedImaging", [...selectedImaging, imaging]);
    } else {
      setValue("recommendedImaging", selectedImaging.filter((i: string) => i !== imaging));
    }
  };

  const injuryTypeOptions = [
    { label: "Please choose an injury type", value: "" },
    ...INJURY_TYPES.map((type) => ({ label: type, value: type }))
  ];

  const severityOptions = [
    { label: "Please choose severity", value: "" },
    { label: "Mild", value: "mild" },
    { label: "Moderate", value: "moderate" },
    { label: "Severe", value: "severe" },
  ];

  return (
    <div className={styles.stepContainer}>
      <h3 className={styles.stepTitle}>Assessment</h3>

      <TextInput
        label="Diagnosis"
        value={watch("diagnosis") || ""}
        placeholder="Enter diagnosis"
        onChange={(val) => setValue("diagnosis", val)}
        error={errors.diagnosis?.message as string}
      />

      <ComboBox
        label="Suspected Injury Type"
        options={injuryTypeOptions}
        value={watch("injuryType") || ""}
        onChange={(val) => setValue("injuryType", val)}
      />
      {errors.injuryType && <span className={styles.error}>{errors.injuryType.message as string}</span>}

      <ComboBox
        label="Severity"
        options={severityOptions}
        value={watch("severity") || ""}
        onChange={(val) => setValue("severity", val)}
      />
      {errors.severity && <span className={styles.error}>{errors.severity.message as string}</span>}

      <div className={styles.formGroup}>
        <label className={styles.label}>Recommended Imaging</label>
        <div className={styles.checkboxGrid}>
          {IMAGING_OPTIONS.map((imaging) => (
            <label key={imaging} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedImaging.includes(imaging)}
                onChange={(e) => handleImagingChange(imaging, e.target.checked)}
              />
              <span>{imaging}</span>
            </label>
          ))}
        </div>
        {errors.recommendedImaging && <span className={styles.error}>{errors.recommendedImaging.message as string}</span>}
      </div>
    </div>
  );
}
