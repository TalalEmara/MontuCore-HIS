// src/components/level-2/Preview/DoctorPreview.tsx
import React from 'react';
import { Preview } from './Preview';
import List from '../../level-0/List/List';
import styles from './Preview.module.css';

interface DoctorPreviewData {
  id: number;
  fullName: string;
  specialty: string;
  email: string;
  upcomingAppointments: (string | number)[][];
}

const mockDoctor: DoctorPreviewData = {
  id: 55,
  fullName: "Dr. Olivia Black",
  specialty: "Orthopedic Surgeon",
  email: "dr.black@med.com",
  upcomingAppointments: [
    ["09:00", "John Doe", "Follow-up"],
    ["10:30", "Jane Smith", "Initial"],
    ["13:00", "Mike Ross", "Surgery Prep"],
  ]
};

export default function DoctorPreview({ onClose }: { onClose?: () => void }) {
  return (
    <Preview onClose={onClose}>
      {/* Col 1: Identity */}
      <div className={styles.headerSection}>
        <div className={styles.titleRow}>
           <h2>{mockDoctor.fullName}</h2>
        </div>
        <div className={styles.subHeader}>
           <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{mockDoctor.specialty}</span>
        </div>
      </div>

      {/* Col 2: Contact Details */}
      <div className={styles.detailsSection}>
         <h3 className={styles.sectionTitle}>Contact Info</h3>
         <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
               <span className={styles.label}>Email</span>
               <span className={styles.value} style={{fontSize: '0.9rem'}}>{mockDoctor.email}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>Clinician ID</span>
               <span className={styles.value}>DOC-{mockDoctor.id}</span>
            </div>
         </div>
      </div>

      {/* Col 3: Schedule List */}
      <div className={styles.listSection}>
         <h3 className={styles.sectionTitle}>Today's Schedule</h3>
         <div style={{ flex: 1, overflow: 'hidden' }}>
            <List header={["Time", "Athlete", "Type"]} data={mockDoctor.upcomingAppointments} />
         </div>
      </div>
    </Preview>
  );
}