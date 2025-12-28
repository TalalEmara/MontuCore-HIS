import { Preview } from './Preview';
import styles from './Preview.module.css';
import List from '../../level-0/List/List';
import { StatusBadge, Status } from '../../level-0/Badge/Badge';
import Button from '../../level-0/Button/Bottom'; 

interface ExamData {
  modality: string;
  bodyPart: string;
  status: Status;
  date: string;
  cost: number;
  athleteName: string;
  doctorName: string;
  images: (string | number)[][]; 
}

const mockExam: ExamData = {
  modality: "MRI",
  bodyPart: "Right Knee",
  status: "IMAGING_COMPLETE" as Status,
  date: "2024-05-10 14:00",
  cost: 450.00,
  athleteName: "Cristiano Ronaldo",
  doctorName: "Dr. Olivia Black",
  images: [
    ["IMG_001.dcm", "Sequence 1"],
    ["IMG_002.dcm", "Sequence 2"],
    ["IMG_003.dcm", "T2 Weighted"],
  ]
};

export default function ExamPreview({ 
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
           <h2>{mockExam.modality} Scan</h2>
           <StatusBadge status={mockExam.status} />
        </div>
        
        <div className={styles.subHeader}>
           <strong>Athlete:</strong> {mockExam.athleteName} 
           <span className={styles.separator}>|</span> 
           <strong>Ordered By:</strong> {mockExam.doctorName}
        </div>

        <div style={{ position: 'absolute', top: 0, right: 0 }}>
          <Button variant="secondary" height="2rem" onClick={onSeeDetails}>
            See Details
          </Button>
        </div>
      </div>

      <div className={styles.detailsSection}>
         <h3 className={styles.sectionTitle}>Order Info</h3>
         <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
               <span className={styles.label}>Region</span>
               <span className={styles.value}>{mockExam.bodyPart}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>Performed At</span>
               <span className={styles.value}>{mockExam.date}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>Cost</span>
               <span className={styles.value}>${mockExam.cost}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>Conclusion</span>
               <span className={styles.value}>No tear detected.</span>
            </div>
         </div>
      </div>

      <div className={styles.listSection}>
         <h3 className={styles.sectionTitle}>DICOM Series</h3>
         <div style={{ flex: 1, overflow: 'hidden' }}>
            <List header={["File Name", "Description"]} data={mockExam.images} />
         </div>
      </div>
    </Preview>
  );
}