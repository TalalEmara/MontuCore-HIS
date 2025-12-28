import { Preview } from './Preview';
import styles from './Preview.module.css';
import { StatusBadge } from '../../level-0/Badge/Badge';
import List from '../../level-0/List/List';
import Button from '../../level-0/Button/Bottom';

export default function LabTestPreview({ onClose, onSeeDetails, data }: any) {
  if (!data) return null;

  // Convert resultValues object from backend into List format
  const results = data.resultValues 
    ? Object.entries(data.resultValues).map(([key, val]) => [key, String(val)]) 
    : [];

  return (
    <Preview onClose={onClose}>
      <div className={styles.headerSection} style={{ position: 'relative' }}>
        <div className={styles.titleRow}>
           <h2 style={{ fontSize: '1.2rem' }}>{data.testName}</h2>
           <StatusBadge status={data.status} />
        </div>
        <div style={{ position: 'absolute', top: 0, right: 0 }}>
          <Button variant="secondary" height="2rem" onClick={onSeeDetails}>See Details</Button>
        </div>
      </div>
      <div className={styles.detailsSection}>
         <div className={styles.infoGrid}>
            <div className={styles.infoItem}><span className={styles.label}>Category</span><span className={styles.value}>{data.category}</span></div>
            <div className={styles.infoItem}><span className={styles.label}>Date</span><span className={styles.value}>{new Date(data.sampleDate).toLocaleDateString()}</span></div>
         </div>
      </div>
      <div className={styles.listSection}>
         <h3 className={styles.sectionTitle}>Quick Results</h3>
         <List header={["Parameter", "Value"]} data={results} />
      </div>
    </Preview>
  );
}