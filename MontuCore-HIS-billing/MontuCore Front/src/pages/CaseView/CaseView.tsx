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

function CaseView() {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "images">("overview");
 
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
            {/* <UsersList
              data={[
                ["01", "Lionel Messi", "Forward", "Pending", "View"],
                ["02", "Cristiano Ronaldo", "Forward", "Injured", "Edit"],
                ["03", "Kevin De Bruyne", "Midfielder", "Pending", "View"],
                ["04", "Virgil van Dijk", "Defender", "Fit", "Disable"],
                ["01", "Lionel Messi", "Forward", "Pending", "View"],
                ["02", "Cristiano Ronaldo", "Forward", "Injured", "Edit"],
                ["03", "Kevin De Bruyne", "Midfielder", "Pending", "View"],
                ["04", "Virgil van Dijk", "Defender", "Fit", "Disable"],
                ["01", "Lionel Messi", "Forward", "Pending", "View"],
                ["02", "Cristiano Ronaldo", "Forward", "Injured", "Edit"],
                ["03", "Kevin De Bruyne", "Midfielder", "Pending", "View"],
                ["03", "Kevin De Bruyne", "Midfielder", "Pending", "View"],
                ["03", "Kevin De Bruyne", "Midfielder", "Pending", "View"],
                ["03", "Kevin De Bruyne", "Midfielder", "Pending", "View"],
                ["04", "Virgil van Dijk", "Defender", "Fit", "Disable"],
              ]}
            /> */}
            <DivomLocalViewer/>
          </div>
        )}
        <p className={styles.title}>
          Case number <span>Dr. Alphons</span>
          <Bill 
            invoiceId={InvoiceId}
            onFetchInvoice={FetchInvoice}
          />
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
          <TreatmentsList
            data={[
              ["Physiotherapy session", "Dr. Ahmed Ali", "150", "2025-11-01"],
              ["MRI Scan", "Dr. Sara Hussein", "600", "2025-11-05"],
              ["Medication plan", "Dr. Omar Nassar", "80", "2025-11-07"],
              ["Surgery follow-up", "Dr. Lina Mansour", "200", "2025-11-10"],
            ]}
          />
        </AdjustableCard>
      </div>
      <div className={styles.physiotherapy}>
        <AdjustableCard title="Physiotherapy" height="100%" maxWidth="100%">
          <div className={styles.physioContent}>
            <div className={styles.physioCards}>
              <InfoCard label="Sessions" value={20} />
              <InfoCard label="Completed" value={10} />
              <InfoCard label="per week" value={2} />
            </div>
            <p>
              Name of program <span>physiotherapist name</span>
            </p>
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
        <Button variant="secondary">delete</Button>
      </div>
       <ReportStepper
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}

export default CaseView;
