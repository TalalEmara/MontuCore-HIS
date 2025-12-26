import React from 'react';
import BasicOverlay from '../../level-0/Overlay/BasicOverlay';
import styles from './Details.module.css';

// Matches Prisma 'Treatment'
interface TreatmentData {
  id: number;
  type: string; // 'Surgery', 'Medication'
  description: string;
  providerName: string;
  date: string;
  cost: number;
}

const mockTreatment: TreatmentData = {
  id: 88,
  type: "Surgery",
  description: "Anterior Cruciate Ligament (ACL) Reconstruction using hamstring autograft.",
  providerName: "St. Mary's Surgical Center",
  date: "2024-11-10",
  cost: 15000.00
};

export default function TreatmentDetail({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <BasicOverlay isOpen={isOpen} onClose={onClose} title="Treatment Details">
      
      <div className={styles.section}>
         <div className={styles.field}>
            <span className={styles.label}>Type</span>
            <span className={styles.valueLarge}>{mockTreatment.type}</span>
         </div>
         <div className={styles.field} style={{ marginTop: '0.5rem'}}>
             <span className={styles.label}>Provider</span>
             <span>{mockTreatment.providerName}</span>
         </div>
      </div>

      <div className={styles.section}>
         <h3 className={styles.sectionTitle}>Description</h3>
         <p className={styles.text}>{mockTreatment.description}</p>
      </div>

      <div className={styles.section}>
         <div className={styles.grid}>
             <div className={styles.field}>
                <span className={styles.label}>Date Performed</span>
                <span>{new Date(mockTreatment.date).toLocaleDateString()}</span>
             </div>
             <div className={styles.field}>
                <span className={styles.label}>Total Cost</span>
                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    ${mockTreatment.cost.toLocaleString()}
                </span>
             </div>
         </div>
      </div>
      
    </BasicOverlay>
  );
}