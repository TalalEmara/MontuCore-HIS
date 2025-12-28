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

function CaseView() {
  const caseId = 2
  const [isReporting, setIsReporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "images">("overview");
  const { caseRecord, isLoading: caseLoading } = useCaseRecord(caseId);

  const [bodyParts, setBodyParts] = useState<any>({});

  const renderBodyComponent = () => {
    if (caseRecord?.exams) {
    const updatedParts: any = {
        head: { show: true, selected: false },
        chest: { show: true, selected: false },
        stomach: { show: true, selected: false },
        left_shoulder: { show: true, selected: false },
        right_shoulder: { show: true, selected: false },
        left_arm: { show: true, selected: false },
        right_arm: { show: true, selected: false },
        left_hand: { show: true, selected: false },
        right_hand: { show: true, selected: false },
        left_leg_upper: { show: true, selected: false },
        right_leg_upper: { show: true, selected: false },
        left_leg_lower: { show: true, selected: false },
        right_leg_lower: { show: true, selected: false },
        left_foot: { show: true, selected: false },
        right_foot: { show: true, selected: false },
    };

    caseRecord.exams.forEach((exam: any) => {
      const rawPart = exam.bodyPart.toLowerCase().trim();
      let partKey = "";

      if (rawPart.includes("head") || rawPart.includes("skull")) partKey = "head";
        else if (rawPart.includes("chest") || rawPart.includes("thorax")) partKey = "chest";
        else if (rawPart.includes("shoulder")) partKey = "left_shoulder"; // Default to left if not specified
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
          selected: true,
           };
      }
    });

    return  <BodyComponent 
             height="75%"
            mode="pain"
            onClick={(id: string) => {
              console.log(id);
            }}
            partsInput={updatedParts} />} }
 
  // const appointments = caseRecord?.
  const treatments = caseRecord?.treatments.map((treatment , indx) => [
    indx+1,
    treatment.type,
    new Date(treatment.date).toLocaleDateString(),
    treatment.providerName
  ] )

  const exams = caseRecord?.exams.map((exam , indx)=>[
    indx+1,
    `${exam.bodyPart}-${exam.modality}`,
    <Badge label={exam.status == "IMAGING_COMPLETE"? "Completed" : "pending"} variant={exam.status == "IMAGING_COMPLETE"? "success" : "pending"}/>
  ])
  
  const Appointments = [
  { id: 1, clinician: "Dr. Smith", date: "2025-01-05", status: "COMPLETED" },
  { id: 2, clinician: "Dr. Jones", date: "2025-01-18", status: "CANCELLED" },
  { id: 3, clinician: "Dr. Taylor", date: "2025-01-25", status: "SCHEDULED" },
  ];

const physioProgram = caseRecord?.physioPrograms.at(-1);
  
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
       case #{caseId} <span>{caseRecord?.managingClinician.fullName}</span>
       <Bill invoiceId={caseId} /> 
    </p>
        
      </div>
     <div className={styles.reports}>
     <AdjustableCard title="Appointments" maxHeight="100%">
      <List
      header={["#", "Clinician", "Date", "Status"]}
      data={Appointments.map(app => [
        app.id, 
        app.clinician, 
        app.date, 
        <Badge 
        label={app.status === "COMPLETED" ? "Completed" : app.status === "CANCELLED" ? "Cancelled" : "Scheduled"} 
        variant={app.status === "COMPLETED" ? "success" : app.status === "CANCELLED" ? "warning" : "pending"} 
      />
      ])}
      gridTemplateColumns="1fr 2fr 2fr 1.1fr" 
    />
    </AdjustableCard>
    </div>
      <div className={styles.treatments}>
        <AdjustableCard title="Treatments" maxHeight="100%" maxWidth="100%">
          <List header = {["#","treatment","date","provider"]} data={treatments} gridTemplateColumns=".2fr 1fr 1fr 1fr"/>
        </AdjustableCard>
      </div>
      <div className={styles.physiotherapy}>
        <AdjustableCard title="Physiotherapy" height="100%" maxWidth="100%">
          <div className={styles.physioContent}>
            <div className={styles.physioCards}>
              <InfoCard label="Sessions" value={physioProgram?.numberOfSessions } />
              <InfoCard label="Completed" value={physioProgram?.sessionsCompleted} />
              <InfoCard label="per week" value={physioProgram?.weeklyRepetition} />
            </div>
            <p>
              {physioProgram?.title} 
              {/* <span>{new Date(physioProgram.startDate).toLocaleDateString}</span> */}
            </p>
          </div>
        </AdjustableCard>
      </div>
      <div className={styles.buttons}>
        <Button 
          variant="secondary" 
          width="100%" 
          className={styles.addbutton}
          onClick={() => setIsReporting(true)}
        >
          Add report
        </Button>
        <Button variant="secondary">delete</Button>
      </div>
      <ReportStepper
              isOpen={isReporting}
              onClose={() => setIsReporting(false)}
              caseId={18}
              clinicianId={1}
              athleteId={29}
              appointmentId={30}
            />
    </div>
  );
}

export default CaseView;
