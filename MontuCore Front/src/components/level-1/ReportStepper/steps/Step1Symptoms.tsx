import type { UseFormReturn } from "react-hook-form";
import Checkbox from "../../../level-0/CheckBox/CheckBox";
import TextInput from "../../../level-0/TextInput/TextInput";
import Slider from "../../../level-0/Slider/Slider";
import RadioButton from "../../../level-0/RadioButton/RadioButton";
import styles from "./Steps.module.css";
import { SYMPTOMS } from "../constants/symptoms";

interface Step1SymptomsProps {
  form: UseFormReturn<any>;
}

export default function Step1Symptoms({ form }: Step1SymptomsProps) {
  const { watch, setValue, formState: { errors } } = form;

  const caseStatus: string = watch("caseStatus") || "";
  const selectedSymptoms: string[] = watch("symptoms") || [];
  const painLevel: number = Number(watch("painLevel") ?? 0);

  const handleCheckboxChange = (symptom: string, checked: boolean) => {
    const updated = checked
      ? [...selectedSymptoms, symptom]
      : selectedSymptoms.filter((s) => s !== symptom);

    setValue("symptoms", updated, { shouldValidate: true });
  };

  const handlePainChange = (val: number | string) => {
    setValue("painLevel", Number(val), { shouldValidate: true });
  };

  return (
    <div className={styles.stepContainer}>
      <h3 className={styles.stepTitle}>Case Status & Symptoms</h3>

      <div className={styles.formGroup}>
        <label className={styles.label}>Case Status</label>
        <div className={styles.radioOptions}>
          <RadioButton
            name="caseStatus"
            value="active"
            label="Active"
            checked={caseStatus === "active"}
            onChange={() => setValue("caseStatus", "active", { shouldValidate: true })}
          />
          <RadioButton
            name="caseStatus"
            value="recovered"
            label="Recovered"
            checked={caseStatus === "recovered"}
            onChange={() => setValue("caseStatus", "recovered", { shouldValidate: true })}
          />
        </div>
        {errors.caseStatus && (
          <span className={styles.error}>{errors.caseStatus.message as string}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Common Symptoms</label>
        <div className={styles.checkboxGrid}>
          {SYMPTOMS.map((symptom) => (
            <Checkbox
              key={symptom}
              label={symptom}
              checked={selectedSymptoms.includes(symptom)}
              onChange={(checked) => handleCheckboxChange(symptom, checked)}
            />
          ))}
        </div>
        {errors.symptoms && (
          <span className={styles.error}>{errors.symptoms.message as string}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <TextInput
          label="Notes"
          value={watch("Notes") || ""}
          placeholder="Enter any observations or notes..."
          onChange={(val) => setValue("Notes", val, { shouldValidate: true })}
          error={errors.Notes?.message as string}
        />
      </div>

      <div className={styles.formGroup}>
        <Slider
          label="Pain Level"
          value={painLevel}
          onChange={handlePainChange}
          min={1}
          max={10}
          marks={["1 - Mild", "10 - Severe"]}
          error={errors.painLevel?.message as string}
        />
      </div>
    </div>
  );
}