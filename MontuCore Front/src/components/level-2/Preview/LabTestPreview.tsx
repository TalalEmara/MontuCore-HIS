import { Preview } from './Preview';
import styles from './Preview.module.css';
import { StatusBadge, Status } from '../../level-0/Badge/Badge';
import List from '../../level-0/List/List';
import Button from '../../level-0/Button/Bottom';

interface LabData {
  testName: string;
  category: string;
  status: Status;
  sampleDate: string;
  technician: string;
  results: (string | number)[][]; 
}

const mockLab: LabData = {
  testName: "Complete Blood Count (CBC)",
  category: "Hematology",
  status: "COMPLETED" as Status,
  sampleDate: "2024-05-12",
  technician: "Lab Corp Inc.",
  results: [
    ["Hemoglobin", "14.5 g/dL"],
    ["WBC", "6.5 K/uL"],
    ["Platelets", "250 K/uL"],
    ["RBC", "5.1 M/uL"],
  ]
};

export default function LabTestPreview({ 
  onClose, 
  onSeeDetails 
}: { 
  onClose?: () => void; 
  onSeeDetails?: () => void 
}) {
  return (
    <Preview onClose={onClose}>
      <div className={styles.headerSection} style={{ position: 'relative' }}>
        <div className={styles.titleRow}>
           <h2 style={{ fontSize: '1.5rem' }}>{mockLab.testName}</h2>
           <StatusBadge status={mockLab.status} />
        </div>
        <div className={styles.subHeader}>
           <strong>Category:</strong> {mockLab.category}
        </div>

        <div style={{ position: 'absolute', top: 0, right: 0 }}>
          <Button variant="secondary" height="2rem" onClick={onSeeDetails}>
            See Details
          </Button>
        </div>
      </div>

      <div className={styles.detailsSection}>
         <h3 className={styles.sectionTitle}>Sample Details</h3>
         <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
               <span className={styles.label}>Sample Date</span>
               <span className={styles.value}>{mockLab.sampleDate}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>Lab Technician</span>
               <span className={styles.value}>{mockLab.technician}</span>
            </div>
         </div>
      </div>

      <div className={styles.listSection}>
         <h3 className={styles.sectionTitle}>Results</h3>
         <div style={{ flex: 1, overflow: 'hidden' }}>
            <List header={["Parameter", "Value"]} data={mockLab.results} />
         </div>
      </div>
    </Preview>
  );
}