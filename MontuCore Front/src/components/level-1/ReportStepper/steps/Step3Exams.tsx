import type { UseFormReturn } from "react-hook-form";
import TextInput from "../../../level-0/TextInput/TextInput";
import styles from "./Steps.module.css";
import { IMAGING_OPTIONS } from "../constants/symptoms";

interface Step3ExamsProps {
  form: UseFormReturn<any>;
}

export default function Step3Exams({ form }: Step3ExamsProps) {
  const { watch, setValue, formState: { errors } } = form;

  const selectedExam = watch("exam")?.[0] || { modality: [], bodyPart: "" };

  const handleImagingChange = (imaging: string, checked: boolean) => {
    const currentModalities = selectedExam.modality || [];
    const newModalities = checked
      ? [...currentModalities, imaging]
      : currentModalities.filter((i: string) => i !== imaging);

    setValue("exam", [{ ...selectedExam, modality: newModalities }], { shouldValidate: true });
  };

  const handleBodyPartChange = (value: string) => {
    setValue("exam", [{ ...selectedExam, bodyPart: value }], { shouldValidate: true });
  };

  return (
    <div className={styles.stepContainer}>
      <h3 className={styles.stepTitle}>Imaging Exam</h3>

      <div className={styles.formGroup}>
        <label className={styles.label}>Imaging</label>
        <div className={styles.checkboxGrid}>
          {IMAGING_OPTIONS.map((imaging) => (
            <label key={imaging} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedExam.modality?.includes(imaging)}
                onChange={(e) => handleImagingChange(imaging, e.target.checked)}
              />
              <span>{imaging}</span>
            </label>
          ))}
        </div>
        {Array.isArray(errors.exam) && errors.exam[0]?.modality && (
          <span className={styles.error}>{errors.exam[0].modality.message}</span>
        )}
        </div>

      <TextInput
        label="Body Part"
        placeholder="Knee, Shoulder, Ankle..."
        value={selectedExam.bodyPart}
        onChange={handleBodyPartChange}
      />
    </div>
  );
}
