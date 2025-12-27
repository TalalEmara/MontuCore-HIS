import { useState } from "react";
import styles from "./CaseView.module.css";
import UsersList from "../../components/level-1/UserList/UsersList";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import Button from "../../components/level-0/Button/Bottom";
import ReportStepper from "../../components/level-1/ReportStepper/ReportStepper";

import InfoCard from "../../components/level-0/InfoCard/InfoCard";
import { BodyComponent } from "@darshanpatel2608/human-body-react";
import TreatmentsList from "../../components/level-1/TreatmentsList/TreatmentsList";
import DivomLocalViewer from "../../components/level-1/DicomViewer/DicomViewer";
// should take specific case data

import Bill from "../../components/level-1/bill/bill";
import { useCaseRecord } from "../../hooks/useCaseRecord";
import Badge from "../../components/level-0/Badge/badge";
import { success } from "zod";
import List from "../../components/level-0/List/List";

function CaseView() {
  const caseId = 2
  const [isReporting, setIsReporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "images">("overview");
  const { caseRecord, isLoading: caseLoading } = useCaseRecord(caseId);

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
          <BodyComponent
            height="75%"
            mode="pain"
            onClick={(id: string) => {
              console.log(id);
            }}
            partsInput={{
              head: { show: true },
              leftShoulder: { show: true },
              rightShoulder: { show: true },
              leftArm: { show: true },
              rightArm: { show: true },
              chest: { show: true },
              stomach: { show: true },
              leftLeg: { show: true },
              rightLeg: { show: true },
              leftHand: { show: true },
              rightHand: { show: true },
              leftFoot: { show: true },
              rightFoot: { show: true },
            }}
          />
        )}

        {activeTab === "images" && (
          <div className={styles.imagesList}>
           
            <List header={["#","exam","status"]} data={exams} />
          </div>
        )}
       <p className={styles.title}>
       case #{caseId} <span>{caseRecord?.managingClinician.fullName}</span>
       <Bill invoiceId={caseId} /> 
    </p>
        
      </div>
      <div className={styles.reports}>
        {/* <p> reports</p> */}
        <AdjustableCard title="Reports" maxHeight="100%">
          <UsersList
            data={[
              ["01", "Lionel Messi", "Forward", "Pending", "View"],
              ["02", "Cristiano Ronaldo", "Forward", "Injured", "Edit"],
              ["03", "Kevin De Bruyne", "Midfielder", "Pending", "View"],
              ["03", "Kevin De Bruyne", "Midfielder", "Pending", "View"],
              ["04", "Virgil van Dijk", "Defender", "Fit", "Disable"],
            ]}
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
