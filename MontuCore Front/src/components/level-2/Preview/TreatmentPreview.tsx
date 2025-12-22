// src/components/level-2/Preview/TreatmentPreview.tsx
import React from 'react';
import { Preview } from './Preview';
import styles from './Preview.module.css';

interface TreatmentData {
  type: string; 
  description: string;
  provider: string; // The Hospital or Clinic performing it
  date: string;
  cost: number;
  athleteName: string;
  doctorName: string; // The clinician who ordered it
}

const mockTreatment: TreatmentData = {
  type: "Surgery",
  description: "Arthroscopic Menisectomy (Partial)",
  provider: "City Central Hospital",
  date: "2024-06-01",
  cost: 12500.00,
  athleteName: "Cristiano Ronaldo",
  doctorName: "Dr. Olivia Black",
};

export default function TreatmentPreview({ onClose }: { onClose?: () => void }) {
  return (
    <Preview onClose={onClose}>
      {/* Col 1: Identity & Actors */}
      <div className={styles.headerSection}>
        <div className={styles.titleRow}>
           <h2>{mockTreatment.type}</h2>
        </div>
        
        {/* Added Athlete & Doctor here */}
        <div className={styles.subHeader}>
           <strong>Athlete:</strong> {mockTreatment.athleteName} 
           <span className={styles.separator}>|</span> 
           <strong>Ordered By:</strong> {mockTreatment.doctorName}
        </div>
      </div>

      {/* Col 2: Description & Provider */}
      <div className={styles.detailsSection}>
         <h3 className={styles.sectionTitle}>Details</h3>
         <p style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', lineHeight: 1.5 }}>
            {mockTreatment.description}
         </p>
         
         {/* Moved Provider to Grid */}
         <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
               <span className={styles.label}>Provider / Location</span>
               <span className={styles.value}>{mockTreatment.provider}</span>
            </div>
         </div>
      </div>

      {/* Col 3: Logistics */}
      <div className={styles.detailsSection} style={{ border: 'none', paddingLeft: 0 }}>
         <h3 className={styles.sectionTitle}>Logistics</h3>
         <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
               <span className={styles.label}>Date</span>
               <span className={styles.value}>{mockTreatment.date}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>Total Cost</span>
               <span className={styles.value} style={{ color: 'var(--primary-color)', fontWeight: 'bold'}}>
                 ${mockTreatment.cost.toLocaleString()}
               </span>
            </div>
         </div>
      </div>
    </Preview>
  );
}