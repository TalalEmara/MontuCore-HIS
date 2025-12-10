import { jsPDF } from "jspdf";
import Button from "../../level-0/Button/Bottom";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Step1Symptoms from "./steps/Step1Symptoms";
import Step2Assessment from "./steps/Step2Assessment";
import Step3Treatment from "./steps/Step3Treatment";

import { step1Schema } from "./schemas/step1";
import { step2Schema } from "./schemas/step2";
import { step3Schema } from "./schemas/step3";
import { fullReportSchema, type FullReport } from "./schemas/fullReport";
import styles from "./ReportStepper.module.css";
import {
  useSubmitReport,
  type SubmitReportRequest,
} from "../../../hooks/useSubmitReport";
interface ReportStepperProps {
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: Partial<FullReport>;

  athleteId: number;
  clinicianId: number;
}

export default function ReportStepper({
  isOpen,
  onClose,
  defaultValues = {},
  athleteId,
  clinicianId,
}: ReportStepperProps) {
  const { mutate: submitReport, isPending } = useSubmitReport();

  const [currentStep, setCurrentStep] = useState(1);
  const [allData, setAllData] = useState<Partial<FullReport>>(defaultValues);

  const getSchema = () => {
    switch (currentStep) {
      case 1:
        return step1Schema;
      case 2:
        return step2Schema;
      case 3:
        return step3Schema;
      default:
        return step1Schema;
    }
  };

  const form = useForm<Partial<FullReport>>({
    resolver: zodResolver(getSchema() as any),
    defaultValues: allData,
    mode: "onSubmit",
    shouldUseNativeValidation: false,
  });

  const handleNext = async () => {
    const valid = await form.trigger();
    if (valid) {
      setAllData((prev) => ({ ...prev, ...form.getValues() }));
      setCurrentStep((s) => Math.min(s + 1, 3)); // max is now 3
    }
  };

  const handleBack = () => {
    setAllData((prev) => ({ ...prev, ...form.getValues() }));
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleViewReport = () => {
    const data = { ...allData, ...form.getValues() };
    generatePDF(data);
  };
const handleFinalSubmit: SubmitHandler<Partial<FullReport>> = (data) => {
    // 1. Merge data from all steps
    const merged = { ...allData, ...data };
    const parseResult = fullReportSchema.safeParse(merged);
    
    if (parseResult.success) {
      // 2. Extract followUpDate correctly from the merged data
      const followUp = merged.followUpDate ? merged.followUpDate : "Not specified";

      // 3. Format the Notes
      const reportText = `[MEDICAL REPORT]
Diagnosis: ${merged.diagnosis}
Severity: ${merged.severity} | Type: ${merged.injuryType}
Pain Level: ${merged.painLevel}/10
Symptoms: ${merged.symptoms?.join(", ")}
Treatment: ${merged.immediateActions}
Rehab: ${merged.rehabPlan}
Follow-up Planned: ${followUp}`; // <--- Added here

      // 4. Create Payload
      const payload: SubmitReportRequest = {
        athleteId: Number(athleteId),
        clinicianId: Number(clinicianId),
        // eslint-disable-next-line react-hooks/purity
        scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        status: "COMPLETED",
        diagnosisNotes: reportText
      };

      // 5. Send
      submitReport(payload, {
        onSuccess: () => {
          generatePDF(parseResult.data, true);
          onClose();
        }
      });
      
    } else {
      console.error("Validation errors:", parseResult.error.format());
    }
  };

  const generatePDF = (data: Partial<FullReport>, save = false) => {
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFontSize(18);
    doc.text("MontuCore Medical Report", 105, 20, { align: "center" });
    doc.setFontSize(12);
    let y = 35;

    const addSectionTitle = (title: string) => {
      y += 10;
      doc.setFontSize(14);
      doc.setTextColor(0, 60, 120);
      doc.text(title, 15, y);
      doc.setFontSize(12);
      y += 5;
    };

    const addLine = (label: string, value: string | number | undefined) => {
      doc.setTextColor(0, 0, 0);
      doc.text(`${label}: ${value || "-"}`, 20, y);
      y += 7;
    };

    const drawDivider = () => {
      doc.setDrawColor(0, 60, 120);
      doc.setLineWidth(0.5);
      doc.line(15, y, 195, y);
      y += 5;
    };

    addSectionTitle("Patient Information");
    addLine("Pain Level", data.painLevel);
    drawDivider();

    addSectionTitle("Symptoms");
    if (data.symptoms?.length)
      data.symptoms.forEach((s, i) => addLine(`Symptom ${i + 1}`, s));
    else addLine("-", "No symptoms reported");
    drawDivider();

    addSectionTitle("Assessment");
    addLine("Diagnosis", data.diagnosis);
    addLine("Injury Type", data.injuryType);
    addLine("Severity", data.severity);
    addLine("Recommended Imaging", data.recommendedImaging?.join(", "));
    drawDivider();

    addSectionTitle("Treatment Plan");
    addLine("Immediate Actions", data.immediateActions);
    addLine("Medication", data.medication);
    addLine("Rehabilitation Plan", data.rehabPlan);
    addLine("Follow-up Date", data.followUpDate);
    drawDivider();

    y += 10;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      "This report is generated by MontuCore Medical System. Confidential and intended for medical use only.",
      105,
      y,
      { align: "center" }
    );

    if (save) doc.save(`Medical_Report_${"patient"}.pdf`);
    else window.open(doc.output("bloburl"), "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Medical Report</h2>
          <Button variant="secondary" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className={styles.mainBody}>
          <div className={styles.stepper}>
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`${styles.step} ${
                  currentStep > step ? styles.completed : ""
                } ${currentStep === step ? styles.active : ""}`}
              >
                <div className={styles.stepNumber}>{step}</div>
                <div className={styles.stepLabel}>
                  {step === 1
                    ? "Patient"
                    : step === 2
                    ? "Symptoms"
                    : step === 3
                    ? "Assessment"
                    : "Treatment"}
                </div>
              </div>
            ))}
          </div>

          <form
            className={styles.content}
            onSubmit={form.handleSubmit(handleFinalSubmit)}
          >
            {currentStep === 1 && <Step1Symptoms form={form} />}
            {currentStep === 2 && <Step2Assessment form={form} />}
            {currentStep === 3 && <Step3Treatment form={form} />}

            <div className={styles.actions}>
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              <div style={{ display: "flex", gap: "6px" }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleViewReport}
                >
                  View Report
                </Button>
                {currentStep < 3 ? (
                  <Button type="button" variant="primary" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" variant="primary">
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
