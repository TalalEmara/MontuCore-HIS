

import { StatusBadge, Status } from '../../level-0/Badge/badge';
import List from '../../level-0/List/List';
import styles from './Preview.module.css'

interface PreviewProps {
    children?: React.ReactNode;
    onClose?: () => void;
}
export function Preview({children , onClose}: PreviewProps) {
  return (
    <div className={styles.panel}>
      <button className={styles.closeButton} onClick={onClose}>×</button>
   <div className={styles.panelContent} >
            {children}
        </div>
        </div>
  )
}

export interface CasePreviewData {
  id: string;
  status: Status;
  athleteName: string;
  doctorName: string;
  injury: {
    type: string;
    date: string;
    severity: string;
  };
  reports: (string | number)[][]; // Matches the List component's data structure
}
function PreviewCase({ onClose }: { onClose?: () => void }) {
    const caseData: CasePreviewData = {
  id: "22",
  status: "Active" as Status,
  athleteName: "John Doe",
  doctorName: "Dr. Olivia Black",
  injury: {
    type: "Hamstring Strain",
    date: "2024-05-10",
    severity: "Moderate",
  },
  reports: [
    [1, "22/4/2025"],
    [2, "22/4/2025"],
    [3, "22/4/2025"],
    [4, "22/4/2025"],
    [5, "22/4/2025"],
    [6, "22/4/2025"],
    [7, "22/4/2025"],
    [8, "22/4/2025"],
    [9, "22/4/2025"],
    [10, "22/4/2025"],
  ]
};
    
   return (
    <Preview onClose={onClose}>
      
      {/* 1. Overview Section: Compact & Clear */}
      <div className={styles.headerSection}>
        <div className={styles.titleRow}>
           <h2>Case #{caseData.id}</h2>
           <StatusBadge status={caseData.status} /> 
        </div>
        <div className={styles.subHeader}>
           <strong>Athlete:</strong> {caseData.athleteName} 
           <span className={styles.separator}>|</span> 
           <strong>Dr.</strong> {caseData.doctorName}
        </div>
      </div>

      {/* <div className={styles.divider} /> */}

      {/* 2. Details Section: Grid Layout for alignment */}
      <div className={styles.detailsSection}>
         <h3 className={styles.sectionTitle}>Injury Details</h3>
         <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
               <span className={styles.label}>Type</span>
               <span className={styles.value}>{caseData.injury.type}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>Date</span>
               <span className={styles.value}>{caseData.injury.date}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>Severity</span>
               <span className={styles.value}>{caseData.injury.severity}</span>
            </div>
         </div>
      </div>

      {/* <div className={styles.divider} /> */}

      {/* 3. List Section: Takes remaining space */}
      <div className={styles.listSection}>
            <List header={["#","Report Date"]} data={caseData.reports} />
        
      </div>

    </Preview>
  );
}
export default PreviewCase