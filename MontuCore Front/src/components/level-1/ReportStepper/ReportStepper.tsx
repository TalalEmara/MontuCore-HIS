import { jsPDF } from "jspdf";
import Button from "../../level-0/Button/Bottom";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Step1Symptoms from "./steps/Step1Symptoms";
import Step2Assessment from "./steps/Step2Assessment";
import Step3Exams from "./steps/Step3Exams";
import Step4Treatment from "./steps/Step4Treatment";

import { step1Schema } from "./schemas/step1";
import { step2Schema } from "./schemas/step2";
import { step3Schema } from "./schemas/step3";
import { step4Schema } from "./schemas/step4";

import { fullReportSchema, type FullReport } from "./schemas/fullReport";
import styles from "./ReportStepper.module.css";

interface ReportStepperProps {
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: Partial<FullReport>;
}

export default function ReportStepper({
  isOpen,
  onClose,
  defaultValues = {},
}: ReportStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [allData, setAllData] = useState<Partial<FullReport>>(defaultValues);

  const getSchema = () => {
    switch (currentStep) {
      case 1: return step1Schema;
      case 2: return step2Schema;
      case 3: return step3Schema;
      case 4: return step4Schema;
      default: return step1Schema;
    }
  };

  const form = useForm<Partial<FullReport>>({
    resolver: zodResolver(getSchema() as any),
    defaultValues: {
      ...allData,
      treatment: allData.treatment && allData.treatment.length > 0 
        ? allData.treatment 
        : [{ type: "", description: "", providerName: "", date: "", cost: 0 }]
    },
    mode: "onSubmit",
    shouldUseNativeValidation: false
  });

  const handleNext = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); 
    const valid = await form.trigger();
    if (valid) {
      const currentValues = form.getValues();
      setAllData(prev => ({ ...prev, ...currentValues }));
      setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    setAllData(prev => ({ ...prev, ...form.getValues() }));
    setCurrentStep(s => Math.max(s - 1, 1));
  };

  const handleViewReport = () => {
    const data = { ...allData, ...form.getValues() };
    const formattedData = formatReportData(data as FullReport);
    generatePDF(formattedData);
  };

  const handleFinalSubmit: SubmitHandler<Partial<FullReport>> = async (data) => {
    const merged = { ...allData, ...data };
    const parseResult = fullReportSchema.safeParse(merged);

    if (parseResult.success) {
      const finalData = formatReportData(parseResult.data);
      console.log("Final Data:", finalData);
      generatePDF(finalData, true);
      onClose();
    } else {
      console.error("VALIDATION ERROR:", parseResult.error);
      form.trigger();
    }
  };

  const formatReportData = (data: FullReport) => {
    return {
      caseStatus: data.caseStatus,
      notes: {
        symptoms: data.symptoms?.join(" - ") || "",
        Notes: data.Notes || "",
        painLevel: data.painLevel,
      },
      diagnosis: `${data.diagnosis} - ${data.injuryType}`,
      rehabProgram: data.rehabProgram || "None",
      severity: data.severity,
      followUpDate: data.followUpDate,
      exam: data.exam || [],
      treatment: data.treatment || []
    };
  };

  const generatePDF = (data: any, save = false) => {
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFontSize(18);
    doc.text("MontuCore Medical Report", 105, 20, { align: "center" });

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

    addSectionTitle("Case Information");
    addLine("Status", data.caseStatus);
    drawDivider();

    addSectionTitle("Notes");
    addLine("Symptoms", data.notes.symptoms);
    addLine("Notes", data.notes.Notes);
    addLine("Pain Level", data.notes.painLevel);
    drawDivider();

    addSectionTitle("Diagnosis & Rehab");
    addLine("Diagnosis", data.diagnosis);
    addLine("Severity", data.severity);
    addLine("Rehab Program", data.rehabProgram);
    addLine("Follow-up", data.followUpDate);
    drawDivider();

    addSectionTitle("Imaging Exam");
    if (Array.isArray(data.exam)) {
      data.exam.forEach((e: any) => {
        addLine("Modality", Array.isArray(e.modality) ? e.modality.join(" - ") : e.modality);
        addLine("Body Part", e.bodyPart || "-");
        y += 3;
      });
    }
    drawDivider();

    addSectionTitle("Treatment");
    if (Array.isArray(data.treatment)) {
      data.treatment.forEach((t: any) => {
        addLine("Type", t.type || "-");
        addLine("Description", t.description || "-");
        addLine("Provider", t.providerName || "-");
        addLine("Date", t.date || "-");
        addLine("Cost", t.cost || "-");
        y += 3;
      });
    }
    drawDivider();

    if (save) doc.save(`Medical_Report_${Date.now()}.pdf`);
    else window.open(doc.output("bloburl"), "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Medical Report</h2>
          <Button variant="secondary" onClick={onClose}>×</Button>
        </div>

        <div className={styles.mainBody}>
          <div className={styles.stepper}>
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`${styles.step} ${currentStep > step ? styles.completed : ""} ${currentStep === step ? styles.active : ""}`}
              >
                <div className={styles.stepNumber}>{step}</div>
                <div className={styles.stepLabel}>
                  {step === 1 ? "Symptoms" : step === 2 ? "Assessment" : step === 3 ? "Exam" : "Treatment"}
                </div>
              </div>
            ))}
          </div>

          <form 
            className={styles.content} 
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep === 4) {
                form.handleSubmit(handleFinalSubmit)(e);
              }
            }}
          >
            {currentStep === 1 && <Step1Symptoms form={form} />}
            {currentStep === 2 && <Step2Assessment form={form} />}
            {currentStep === 3 && <Step3Exams form={form} />}
            {currentStep === 4 && <Step4Treatment form={form} />}

            <div className={styles.actions}>
              <Button type="button" variant="secondary" onClick={handleBack} disabled={currentStep === 1}>
                Back
              </Button>

              <div style={{ display: "flex", gap: "6px" }}>
                <Button type="button" variant="secondary" onClick={handleViewReport}>
                  View Report
                </Button>
                {currentStep < 4 ? (
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