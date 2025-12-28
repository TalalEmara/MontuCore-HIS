import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./RiskNotesPanel.module.css";
import Button from "../../level-0/Button/Bottom";
import TextInput from "../../level-0/TextInput/TextInput"; 
import ComboBox from "../../level-0/ComboBox/ComboBox";
import Checkbox from "../../level-0/CheckBox/CheckBox"; 
import { useAllAthletes, useAllClinicians } from "../../../hooks/useUsers";

const riskNoteSchema = z.object({
  athleteId: z.string().min(1, "Please select a patient"),
  clinicianId: z.string().min(1, "Please select a clinician"),
  severity: z.string().min(1, "Please select severity"),
  categories: z.array(z.string()).min(1, "Select at least one observation"),
  notes: z.string().min(5, "Notes are required"),
});

type RiskNoteFormData = z.infer<typeof riskNoteSchema>;

interface RiskNotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Removed 'patients' prop as we are fetching athletes internally
}

const CATEGORIES = ["Inflammation", "Muscle Fatigue", "Joint Pain", "Limited ROM", "Load Issue", "Neural Tension"];
const SEVERITIES = ["MILD", "MODERATE", "SEVERE", "CRITICAL"];

export default function RiskNotesPanel({ isOpen, onClose }: RiskNotesPanelProps) {
  const [successMsg, setSuccessMsg] = useState("");
  
  // 1. Fetch data directly
  const { data: Athletes } = useAllAthletes();
  const { data: Clinicians } = useAllClinicians();

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch, getValues } = useForm<RiskNoteFormData>({
    resolver: zodResolver(riskNoteSchema),
    defaultValues: { 
      athleteId: "", // Initialize empty, let useEffect fill it when data arrives
      clinicianId: "",
      severity: "MILD", 
      categories: [], 
      notes: "" 
    }
  });

  // 2. Set default athlete when data loads and modal opens
  useEffect(() => {
    if (isOpen && Athletes && Athletes.length > 0) {
      // Only set default if no value is currently selected to avoid overwriting user choice
      if (!getValues("athleteId")) {
        setValue("athleteId", String(Athletes[0].id));
      }
    }
  }, [isOpen, Athletes, setValue, getValues]);

  const selectedCategories = watch("categories");

  const getActiveStyles = (sev: string) => {
    switch (sev) {
      case "MILD": 
        return { color: "var(--success)", bg: "hsl(from var(--success) h s l / 0.1)" };
      case "MODERATE": 
        return { color: "var(--accent)", bg: "hsl(from var(--accent) h s l / 0.1)" };
      case "SEVERE": 
        return { color: "hsl(from var(--primary-color) h s calc(l + 20))", bg: "hsl(from var(--primary-color) h s l / 0.1)" };
      case "CRITICAL": 
        return { color: "var(--secondary-color)", bg: "hsl(from var(--secondary-color) h s l / 0.1)" };
      default: 
        return { color: "var(--text-color)", bg: "transparent" };
    }
  };

  const handleCheckboxChange = (cat: string, checked: boolean) => {
    const current = [...(selectedCategories || [])]; // Safety check
    if (checked) {
      current.push(cat);
    } else {
      const index = current.indexOf(cat);
      if (index > -1) current.splice(index, 1);
    }
    setValue("categories", current, { shouldValidate: true });
  };

  const onSubmit = (data: RiskNoteFormData) => {
    // 3. Safe find with optional chaining
    const selectedAthlete = Athletes?.find(p => String(p.id) === data.athleteId);
    const selectedClinician = Clinicians?.find(c => String(c.id) === data.clinicianId);

    const finalData = {
      ...data,
      athleteName: selectedAthlete ? selectedAthlete.fullName : "Unknown", // Used fullName instead of label
      clinicianName: selectedClinician ? selectedClinician.fullName : "Unknown"
    };

    console.log("FINAL OBJECT:", finalData);
    setSuccessMsg("Notes Saved Successfully!");
    
    setTimeout(() => {
      reset();
      setSuccessMsg("");
      onClose();
    }, 800);
  };

  const onInvalid = (formErrors: any) => {
    console.error("VALIDATION FAILED:", formErrors);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Clinical Risk Entry</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {successMsg ? (
          <div className={styles.successMsg}>{successMsg}</div>
        ) : (
          <form 
            className={styles.formContent} 
            onSubmit={handleSubmit(onSubmit, onInvalid)}
          >
            
            <Controller
              name="athleteId"
              control={control}
              render={({ field }) => (
                <div className={styles.fieldGroup}>
                  <ComboBox 
                    label="Select Athlete" 
                    // 4. Transform data safely
                    options={Athletes ? Athletes.map(a => ({ label: a.fullName, value: String(a.id) })) : []}
                    value={field.value} 
                    onChange={field.onChange} 
                  />
                  {errors.athleteId && <span className={styles.errorText}>{errors.athleteId.message}</span>}
                </div>
              )}
            />

            <Controller
              name="athleteId"
              control={control}
              render={({ field }) => (
                <div className={styles.fieldGroup}>
                  <ComboBox 
                    label="Select Athlete" 
                    options={Athletes ? Athletes.map(a => ({ label: a.fullName, value: String(a.id) })) : []}
                    value={field.value} 
                    onChange={field.onChange} 
                  />
                  {errors.athleteId && <span className={styles.errorText}>{errors.athleteId.message}</span>}
                </div>
              )}
            />

            <div className={styles.automationContainer}>
              <label className={styles.label}>Risk Severity</label>
              <div className={styles.presetGrid}>
                {SEVERITIES.map((sev) => (
                  <Controller
                    key={sev}
                    name="severity"
                    control={control}
                    render={({ field }) => {
                      const isActive = field.value === sev;
                      const activeTheme = getActiveStyles(sev);
                      return (
                        <button
                          type="button"
                          className={styles.presetChip}
                          style={{
                            backgroundColor: isActive ? activeTheme.bg : 'rgba(255,255,255,0.05)',
                            color: isActive ? activeTheme.color : 'var(--text-color)',
                            borderColor: isActive ? activeTheme.color : 'rgba(255,255,255,0.1)',
                            fontWeight: isActive ? '700' : '400'
                          }}
                          onClick={() => field.onChange(sev)}
                        >
                          {sev}
                        </button>
                      );
                    }}
                  />
                ))}
              </div>
            </div>

            <div className={styles.automationContainer}>
              <label className={styles.label}>Observations</label>
              <div className={styles.checkboxGrid}>
                {CATEGORIES.map((cat) => (
                  <Checkbox
                    key={cat}
                    label={cat}
                    checked={selectedCategories?.includes(cat) || false}
                    onChange={(checked) => handleCheckboxChange(cat, checked)}
                  />
                ))}
              </div>
              {errors.categories && <span className={styles.errorText}>{errors.categories.message}</span>}
            </div>

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextInput 
                  label="Detailed Notes" 
                  placeholder="Describe symptoms..."
                  value={field.value} 
                  onChange={field.onChange} 
                  error={errors.notes?.message}
                  height="4rem" 
                />
              )}
            />

            <div className={styles.actions}>
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Record</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}