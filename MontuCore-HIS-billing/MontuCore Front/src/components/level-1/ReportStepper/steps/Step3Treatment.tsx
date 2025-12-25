import type { UseFormReturn } from "react-hook-form";
import TextInput from "../../../level-0/TextInput/TextInput";
import styles from "./Steps.module.css";

interface Step4TreatmentProps {
  form: UseFormReturn<any>;
}

export default function Step4Treatment({ form }: Step4TreatmentProps) {
  const { watch, setValue, formState: { errors } } = form;

  const immediateActions = watch("immediateActions") ?? "";
  const medication = watch("medication") ?? "";
  const rehabPlan = watch("rehabPlan") ?? "";
  const followUpDate = watch("followUpDate") ?? "";

  return (
    <div className={styles.stepContainer}>
      <h3 className={styles.stepTitle}>Treatment Plan</h3>

      <TextInput
        label="Immediate Actions"
        value={immediateActions}
        placeholder="Rest, Ice, Compression, Elevation..."
        onChange={(val) => setValue("immediateActions", val)}
        error={errors.immediateActions?.message as string}
      />

      <TextInput
        label="Medication (Optional)"
        value={medication}
        placeholder="Anti-inflammatory, Pain relief..."
        onChange={(val) => setValue("medication", val)}
        error={errors.medication?.message as string}
      />

      <TextInput
        label="Rehabilitation Plan"
        value={rehabPlan}
        placeholder="Physiotherapy 3x/week, Range of motion exercises..."
        onChange={(val) => setValue("rehabPlan", val)}
        error={errors.rehabPlan?.message as string}
      />

      <TextInput
        label="Follow-up Date"
        type="date"
        value={followUpDate}
        onChange={(val) => setValue("followUpDate", val)}
        error={errors.followUpDate?.message as string}
      />
    </div>
  );
}
