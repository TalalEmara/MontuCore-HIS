import type { UseFormReturn } from "react-hook-form";
import TextInput from "../../../level-0/TextInput/TextInput";
import ComboBox from "../../../level-0/ComboBox/ComboBox";
import styles from "./Steps.module.css";

interface Step4TreatmentProps {
  form: UseFormReturn<any>;
}

export default function Step4Treatment({ form }: Step4TreatmentProps) {
  const { watch, setValue, formState: { errors } } = form;

  const treatments = watch("treatment") || [
    { type: "", description: "", providerName: "", date: "", cost: 0 }
  ];

  const updateTreatment = (index: number, field: string, value: any) => {
    const updated = [...treatments];
    updated[index] = { ...updated[index], [field]: value };
    setValue("treatment", updated, { shouldValidate: true });
  };

  const typeOptions = [
    { label: "Surgery", value: "Surgery" },
    { label: "Medication", value: "Medication" },
  ];

  // Cast to any to bypass the complex Nested FieldError type checking
  const treatmentErrors = errors.treatment as any;

  return (
    <div className={styles.stepContainer}>
      <h3 className={styles.stepTitle}>Treatment Plan</h3>

      {treatments.map((treatment: any, index: number) => (
        <div key={index} className={styles.formGroup} style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
          <ComboBox
            label="Type"
            options={typeOptions}
            value={treatment.type}
            onChange={(val) => updateTreatment(index, "type", val)}
          />
          {treatmentErrors?.[index]?.type && (
            <span className={styles.error}>
              {treatmentErrors[index].type.message}
            </span>
          )}

          <TextInput
            label="Provider"
            value={treatment.providerName}
            onChange={(val) => updateTreatment(index, "providerName", val)}
            error={treatmentErrors?.[index]?.providerName?.message}
          />

          <TextInput
            label="Description"
            value={treatment.description}
            onChange={(val) => updateTreatment(index, "description", val)}
            height={80}
            error={treatmentErrors?.[index]?.description?.message}
          />

          <TextInput
            label="Date"
            type="date"
            value={treatment.date}
            onChange={(val) => updateTreatment(index, "date", val)}
            error={treatmentErrors?.[index]?.date?.message}
          />

          <TextInput
            label="Cost"
            type="number"
            value={treatment.cost?.toString()}
            onChange={(val) => updateTreatment(index, "cost", val === "" ? 0 : Number(val))}
            error={treatmentErrors?.[index]?.cost?.message}
          />
        </div>
      ))}

      {errors.treatment?.message && (
        <span className={styles.error}>{errors.treatment.message as string}</span>
      )}
    </div>
  );
}