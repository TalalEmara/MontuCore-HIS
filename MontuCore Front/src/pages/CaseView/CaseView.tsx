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
import { getRouteApi } from "@tanstack/react-router";
import { useCaseRecord } from "../../hooks/useCaseRecord";
import LabTestsList from "../../components/level-1/LabTestsList/LabTestsList";
const routeApi = getRouteApi("/case/$caseId");
function CaseView() {
 const { caseId } = routeApi.useParams();
 const { data: caseRecord, isLoading, isError } = useCaseRecord(caseId);
 const currentPhysioProgram = caseRecord?.physioPrograms[0];  
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "images">("overview");
  const treatmentsData = caseRecord?.treatments.map((t) => [
  t.type,                                      
  t.providerName || "Unknown Provider",        
  t.cost.toString(),                           
  new Date(t.date).toLocaleDateString()        // Column 4: Date (Formatted)
]) || [];
  const labTestsData = caseRecord?.labTests.map((t,indx) => [
  (indx+1),                                      
  t.testName ,        
  t.category ,        
  t.status,                           
  new Date(t.sampleDate).toLocaleDateString()        // Column 4: Date (Formatted)
]) || [];
  //test bill
  const InvoiceId = "test-invoice-001";
    const FetchInvoice = async (id: string) => {
      return {
        invoiceNumber: "INV-202512-0001",
        invoiceDate: "2025-12-08",
        dueDate: "2025-01-07",
        patient: { name: "John Doe", email: "john@example.com", id: "PAT-001" },
        items: [
          { description: "Physiotherapy session", quantity: 1, unitPrice: 150, total: 150 },
          { description: "MRI Scan", quantity: 1, unitPrice: 600, total: 600 }
        ],
        subtotal: 750,
        tax: 75,
        discount: 50,
        totalAmount: 775,
        paidAmount: 400,
        status: "PARTIALLY_PAID" as const,
        caseId: "CASE-123",
        notes: "Follow-up session required",
        createdBy: "Dr. Alphons"
      };
    };
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
            <UsersList
              data={[
                ["01", "Lionel Messi", "Forward", "Pending", "View"],
                ["02", "Cristiano Ronaldo", "Forward", "Injured", "Edit"],
                ["03", "Kevin De Bruyne", "Midfielder", "Pending", "View"],
                ["04", "Virgil van Dijk", "Defender", "Fit", "Disable"],
                ["01", "Lionel Messi", "Forward", "Pending", "View"],
                ["02", "Cristiano Ronaldo", "Forward", "Injured", "Edit"],
                ["03", "Kevin De Bruyne", "Midfielder", "Pending", "View"],
                ["04", "Virgil van Dijk", "Defender", "Fit", "Disable"],
              ]}
            />
          </div>
        )}
        <p className={styles.title}>
           {caseRecord?.athlete.fullName} | Case #{caseId}  <span>{caseRecord?.managingClinician.fullName}</span>
        </p>
        <p className={styles.subTitle}>{caseRecord?.diagnosisName}</p>
        
      </div>
      <div className={styles.reports}>
        {/* <p> reports</p> */}
        <AdjustableCard title="Laboratory Tests" maxHeight="100%">
          <LabTestsList
            data={labTestsData}
          />
        </AdjustableCard>
      </div>
      <div className={styles.treatments}>
        <AdjustableCard title="Treatments" maxHeight="100%" maxWidth="100%">
          <TreatmentsList
            data={treatmentsData}
          />
        </AdjustableCard>
      </div>
      <div className={styles.physiotherapy}>
        <AdjustableCard title="Physiotherapy" height="100%" maxWidth="100%">
          <div className={styles.physioContent}>
            <div className={styles.physioCards}>
              <InfoCard label="Sessions" value={currentPhysioProgram?.numberOfSessions} />
              <InfoCard label="Completed" value={currentPhysioProgram?.sessionsCompleted} />
              <InfoCard label="per week" value={currentPhysioProgram?.weeklyRepetition} />
            </div>
            <a href="">
              {currentPhysioProgram?.title} | {new Date( currentPhysioProgram?.startDate).toLocaleDateString() }
            </a>
          </div>
        </AdjustableCard>
      </div>
      <div className={styles.buttons}>
        <Button 
          variant="secondary" 
          width="100%" 
          className={styles.addbutton}
          onClick={() => setIsReportOpen(true)}
        >
          Add report
        </Button>
        <Bill 
            invoiceId={InvoiceId}
            onFetchInvoice={FetchInvoice}
          />
      </div>
       <ReportStepper
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}

export default CaseView;
