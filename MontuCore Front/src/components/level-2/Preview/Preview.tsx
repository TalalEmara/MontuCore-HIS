import { StatusBadge, Status } from '../../level-0/Badge/Badge';
import List from '../../level-0/List/List';
import Button from '../../level-0/Button/Bottom'; 
import styles from './Preview.module.css';

interface PreviewProps {
    children?: React.ReactNode;
    onClose?: () => void;
}

export function Preview({children , onClose}: PreviewProps) {
  return (
    <div className={styles.panel}>
      <button className={styles.closeButton} onClick={onClose}>×</button>
      <div className={styles.panelContent} >{children}</div>
    </div>
  )
}

interface PreviewCaseProps {
  onClose?: () => void;
  onSeeDetails?: () => void;
  data?: any; 
}

function PreviewCase({ onClose, onSeeDetails, data }: PreviewCaseProps) {
  if (!data) return null;

  const caseData = {
    id: data.id,
    status: (data.status || "Active") as Status,
    athleteName: data.athlete?.fullName || "Unknown",
    doctorName: data.managingClinician?.fullName || "System Admin",
    injury: {
      type: data.diagnosisName || "Unknown",
      date: data.injuryDate ? new Date(data.injuryDate).toLocaleDateString() : "N/A",
      severity: data.severity || "Unknown",
    },
    reports: [ ["1", "Initial Report"] ] // Placeholder or map from data
  };
    
  return (
    <Preview onClose={onClose}>
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

      {onSeeDetails && (
        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <Button onClick={onSeeDetails} width="100%">See Full Case Record</Button>
        </div>
      )}
    </Preview>
  );
}

export default PreviewCase;