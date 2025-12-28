import { useState } from "react";
import styles from "./CaseView.module.css";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import Button from "../../components/level-0/Button/Bottom";
import ReportStepper from "../../components/level-1/ReportStepper/ReportStepper";

import InfoCard from "../../components/level-0/InfoCard/InfoCard";
import { BodyComponent } from "@darshanpatel2608/human-body-react";

import Bill from "../../components/level-1/bill/bill";
import { useCaseRecord } from "../../hooks/useCaseRecord";
import Badge from "../../components/level-0/Badge/Badge";
import List from "../../components/level-0/List/List";
import { useNavigate, useParams } from "@tanstack/react-router";

// Imports for Overlays and Types
import AppointmentOverlay from "../../components/level-2/DetailsOverlay/AppointmentOverlay";
import TreatmentDetail, { type TreatmentData } from "../../components/level-2/DetailsOverlay/TreatmentOverlay";
import { type Appointment, type Treatment } from "../../types/models";
import { useAuth } from "../../context/AuthContext";

function CaseView() {
  const params = useParams({ strict: false });
  const caseId = Number(params.caseId);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isReporting, setIsReporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "images">("overview");
  

  const { caseRecord, isLoading: caseLoading } = useCaseRecord(caseId);

  // --- Overlay State ---
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentOverlay, setShowAppointmentOverlay] = useState(false);

  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentData | undefined>(undefined);
  const [showTreatmentOverlay, setShowTreatmentOverlay] = useState(false);

  // --- Derived Data ---
  const appointmentsData = caseRecord?.appointments || [];
  const treatmentsList = caseRecord?.treatments || [];
  const physioProgram = caseRecord?.physioPrograms?.at(-1);

  const renderBodyComponent = () => {
    if (caseRecord?.exams) {
      const updatedParts: any = {
          head: { show: true, selected: true },
          chest: { show: true, selected: true },
          stomach: { show: true, selected: true },
          left_shoulder: { show: true, selected: true },
          right_shoulder: { show: true, selected: true },
          left_arm: { show: true, selected: true },
          right_arm: { show: true, selected: true },
          left_hand: { show: true, selected: true },
          right_hand: { show: true, selected: true },
          left_leg_upper: { show: true, selected: true },
          right_leg_upper: { show: true, selected: true },
          left_leg_lower: { show: true, selected: true },
          right_leg_lower: { show: true, selected: true },
          left_foot: { show: true, selected: true },
          right_foot: { show: true, selected: true },
      };

      caseRecord.exams.forEach((exam: any) => {
        const rawPart = exam.bodyPart.toLowerCase().trim();
        let partKey = "";

        if (rawPart.includes("head") || rawPart.includes("skull")) partKey = "head";
          else if (rawPart.includes("chest") || rawPart.includes("thorax")) partKey = "chest";
          else if (rawPart.includes("shoulder")) partKey = "left_shoulder"; 
          else if (rawPart.includes("hand")) partKey = "left_hand";
          else if (rawPart.includes("foot") || rawPart.includes("ankle")) partKey = "left_foot";
          else if (rawPart.includes("knee") || rawPart.includes("leg")) partKey = "left_leg_upper";
          else if (rawPart.includes("arm")) partKey = "left_arm";
          else {
            partKey = rawPart.replace(" ", "_");
          }

        if (partKey && updatedParts[partKey]) {
          updatedParts[partKey] = { 
            ...updatedParts[partKey], 
            selected: false,
             };
        }
      });

      return <BodyComponent 
               height="75%"
               mode="pain"
               onClick={(id: string) => {
                 console.log(id);
               }}
               partsInput={updatedParts} 
             />
    } 
  }

  // --- Prepare Rows for Lists ---

  const treatmentsRows = treatmentsList.map((treatment: Treatment, indx: number) => [
    indx + 1,
    treatment.type,
    new Date(treatment.date).toLocaleDateString(),
    treatment.providerName
  ]);

  const appointmentsRows = appointmentsData.map((app: Appointment) => [
    app.id, 
    app.clinician?.fullName || 'Unknown', 
    new Date(app.scheduledAt).toLocaleDateString(), 
    <Badge 
      label={app.status === "COMPLETED" ? "Completed" : app.status === "CANCELLED" ? "Cancelled" : "Scheduled"} 
      variant={app.status === "COMPLETED" ? "success" : app.status === "CANCELLED" ? "warning" : "pending"} 
    />
  ]);
  
  return (
    <div className={styles.caseView}>
      <div className={styles.overview}>
        <div className={styles.tabButtons}>
          <Button
            variant="secondary"
            onClick={() => setActiveTab("overview")}
            className={styles.tabButton}
          >
            overview
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveTab("images")}
            className={styles.tabButton}
          >
            Images
          </Button>
        </div>
        {activeTab === "overview" && (
          renderBodyComponent()
        )}

        {activeTab === "images" && (
          <div className={styles.imagesList}>
            <List 
              onRowClick={()=>navigate({ to: "/dicom" })}
              header={["#", "Modality", "Body Part", "Date", "Status"]} 
              data={caseRecord?.exams.map((exam) => [
                `#${exam.id}`,
                exam.modality,
                exam.bodyPart,
                new Date(exam.performedAt || exam.scheduledAt).toLocaleDateString(),
                <Badge 
                  label={exam.status === "IMAGING_COMPLETE" ? "Completed" : "Pending"} 
                  variant={exam.status === "IMAGING_COMPLETE" ? "success" : "pending"} 
                />
              ]) || []} 
              gridTemplateColumns=".5fr 1fr 1fr 1.5fr 1.2fr"
            />
          </div>
        )}
        <p className={styles.title}>
          case #{caseRecord?.id || caseId} <span>{caseRecord?.managingClinician?.fullName}</span>
        </p>
      </div>

      <div className={styles.reports}>
        <AdjustableCard title="Appointments" maxHeight="100%">
          <List
            header={["#", "Clinician", "Date", "Status"]}
            data={appointmentsRows}
            gridTemplateColumns="1fr 2fr 2fr 1.1fr"
            onRowClick={(index) => {
              if (appointmentsData[index]) {
                setSelectedAppointment(appointmentsData[index]);
                setShowAppointmentOverlay(true);
              }
            }} 
          />
        </AdjustableCard>
      </div>

      <div className={styles.treatments}>
        <AdjustableCard title="Treatments" maxHeight="100%" maxWidth="100%">
          <List 
            header={["#","treatment","date","provider"]} 
            data={treatmentsRows} 
            gridTemplateColumns=".2fr 1fr 1fr 1fr"
            onRowClick={(index) => {
              const t = treatmentsList[index];
              if (t) {
                setSelectedTreatment({
                  id: t.id,
                  type: t.type,
                  description: t.description,
                  providerName: t.providerName,
                  date: t.date,
                  cost: t.cost
                });
                setShowTreatmentOverlay(true);
              }
            }}
          />
        </AdjustableCard>
      </div>

      <div className={styles.physiotherapy}>
        <AdjustableCard title="Physiotherapy" height="100%" maxWidth="100%">
          <div className={styles.physioContent}>
            <div className={styles.physioCards}>
              <InfoCard label="Sessions" value={physioProgram?.numberOfSessions || "" } />
              <InfoCard label="Completed" value={physioProgram?.sessionsCompleted || ""} />
              <InfoCard label="per week" value={physioProgram?.weeklyRepetition || ""} />
            </div>
            <p>
              {physioProgram?.title || "No Active Program"} 
            </p>
          </div>
        </AdjustableCard>
      </div>

      <div className={styles.buttons}>
        {/* Role-Based Button Rendering */}
        {user ? (
          user.role === 'ATHLETE' ? (
            <Bill invoiceId={caseId} />
          ) : (
            <>
              <Button 
                variant="secondary" 
                width="75%" 
                className={styles.addbutton}
                onClick={() => setIsReporting(true)}
              >
                Add report
              </Button>
              <Button 
                variant="secondary" 
                width="20%" 
                className={styles.addbutton}
                onClick={() => navigate({ to: `/physician/consult/${caseRecord?.appointments.at(-1)?.athleteId}` })}
              >
                consult
              </Button>
              <Bill invoiceId={caseId} /> 
            </>
          )
        ) : null}
      </div>

      {/* --- Overlays --- */}
      
      <ReportStepper
        isOpen={isReporting}
        onClose={() => setIsReporting(false)}
        caseId={caseId}
        clinicianId={user?.id || 1}
        athleteId={caseRecord?.athlete?.id || 0}
        appointmentId={caseRecord?.appointments?.at(-1)?.id}
      />

      <AppointmentOverlay 
        isOpen={showAppointmentOverlay}
        onClose={() => setShowAppointmentOverlay(false)}
        appointment={selectedAppointment}
      />

      <TreatmentDetail
        isOpen={showTreatmentOverlay}
        onClose={() => setShowTreatmentOverlay(false)}
        treatmentData={selectedTreatment}
      />

    </div>
  );
}

export default CaseView;