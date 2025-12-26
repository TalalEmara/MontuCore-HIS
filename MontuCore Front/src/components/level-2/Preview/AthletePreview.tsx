// src/components/level-2/Preview/AthletePreview.tsx
import React from 'react';
import { Preview } from './Preview';
import styles from './Preview.module.css'; // Reusing your existing generic styles
import List from '../../level-0/List/List';

// Mock Data Interface based on Prisma 'User' + 'AthleteProfile'
interface AthletePreviewData {
  id: number;
  fullName: string;
  email: string;
  position: string;
  jerseyNumber: number;
  dob: string;
  activeCases: (string | number)[][]; // formatted for List
}

const mockAthlete: AthletePreviewData = {
  id: 101,
  fullName: "Cristiano Ronaldo",
  email: "cr7@club.com",
  position: "Striker",
  jerseyNumber: 7,
  dob: "1985-02-05",
  activeCases: [
    ["#22", "Hamstring Strain", "Active"],
    ["#15", "Ankle Sprain", "Recovered"],
  ]
};

export default function AthletePreview({ onClose }: { onClose?: () => void }) {
  return (
    <Preview onClose={onClose}>
      {/* Col 1: Identity */}
      <div className={styles.headerSection}>
        <div className={styles.titleRow}>
           <h2>{mockAthlete.fullName}</h2>
        </div>
        <div className={styles.subHeader}>
           <strong>#{mockAthlete.jerseyNumber}</strong> 
           <span className={styles.separator}>|</span> 
           {mockAthlete.position}
        </div>
      </div>

      {/* Col 2: Bio Details */}
      <div className={styles.detailsSection}>
         <h3 className={styles.sectionTitle}>Athlete Bio</h3>
         <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
               <span className={styles.label}>Email</span>
               <span className={styles.value} style={{fontSize: '0.9rem'}}>{mockAthlete.email}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>Date of Birth</span>
               <span className={styles.value}>{mockAthlete.dob}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>ID</span>
               <span className={styles.value}>ATH-{mockAthlete.id}</span>
            </div>
         </div>
      </div>

      {/* Col 3: Medical History List */}
      <div className={styles.listSection}>
         <h3 className={styles.sectionTitle}>Recent Cases</h3>
         <div style={{ flex: 1, overflow: 'hidden' }}>
            <List header={["ID", "Diagnosis", "Status"]} data={mockAthlete.activeCases} />
         </div>
      </div>
    </Preview>
  );
}