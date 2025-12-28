import { Preview } from './Preview';
import styles from './Preview.module.css';
import List from '../../level-0/List/List';
import { StatusBadge } from '../../level-0/Badge/Badge';
import Button from '../../level-0/Button/Bottom'; 

export default function ExamPreview({ onClose, onSeeDetails, data }: any) {
  if (!data) return null;

  const images = data.pacsImages?.map((img: any) => [img.fileName, "DICOM File"]) || [];

  return (
    <Preview onClose={onClose}>
      <div className={styles.headerSection} style={{ position: 'relative' }}>
        <div className={styles.titleRow}>
           <h2>{data.modality} Scan</h2>
           <StatusBadge status={data.status} />
        </div>
        <div style={{ position: 'absolute', top: 0, right: 0 }}>
          <Button variant="secondary" height="2rem" onClick={onSeeDetails}>See Details</Button>
        </div>
      </div>
      <div className={styles.detailsSection}>
         <div className={styles.infoGrid}>
            <div className={styles.infoItem}><span className={styles.label}>Region</span><span className={styles.value}>{data.bodyPart}</span></div>
            <div className={styles.infoItem}><span className={styles.label}>Case</span><span className={styles.value}>{data.medicalCase?.diagnosisName}</span></div>
         </div>
      </div>
      <div className={styles.listSection}>
         <h3 className={styles.sectionTitle}>Series</h3>
         <List header={["File", "Type"]} data={images} />
      </div>
    </Preview>
  );
}