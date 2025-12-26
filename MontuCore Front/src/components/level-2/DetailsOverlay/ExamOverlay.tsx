import React from 'react';
import BasicOverlay from '../../level-0/Overlay/BasicOverlay';
import styles from './Details.module.css';
import { StatusBadge } from '../../level-0/Badge/badge';
// Matches Prisma 'Exam'
interface ExamData {
  id: number;
  modality: string; // 'MRI', 'CT'
  bodyPart: string;
  status: string;
  scheduledAt: string;
  performedAt?: string;
  radiologistNotes?: string;
  conclusion?: string;
  cost: number;
}

const mockExam: ExamData = {
  id: 405,
  modality: "MRI",
  bodyPart: "Left Shoulder",
  status: "IMAGING_COMPLETE",
  scheduledAt: "2024-12-19T14:00:00Z",
  performedAt: "2024-12-19T14:15:00Z",
  cost: 850.00,
  radiologistNotes: "Patient tolerated procedure well. Contrast administered.",
  conclusion: "Mild supraspinatus tendinosis. No full-thickness tear."
};

export default function ExamDetail({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <BasicOverlay isOpen={isOpen} onClose={onClose} title="Imaging Exam Details">
      
      {/* Header Info */}
      <div className={styles.section}>
         <div className={styles.row}>
            <div>
              <span className={styles.label}>Modality</span>
              <div className={styles.valueLarge}>{mockExam.modality} - {mockExam.bodyPart}</div>
            </div>
            <StatusBadge status={mockExam.status} />
         </div>
      </div>

      {/* Timeline & Cost */}
      <div className={styles.section}>
         <div className={styles.grid}>
            <div className={styles.field}>
               <span className={styles.label}>Scheduled</span>
               <span>{new Date(mockExam.scheduledAt).toLocaleString()}</span>
            </div>
            <div className={styles.field}>
               <span className={styles.label}>Performed</span>
               <span>{mockExam.performedAt ? new Date(mockExam.performedAt).toLocaleString() : '-'}</span>
            </div>
            <div className={styles.field}>
               <span className={styles.label}>Cost</span>
               <span>${mockExam.cost}</span>
            </div>
         </div>
      </div>

      {/* Radiological Report */}
      <div className={styles.section}>
         <h3 className={styles.sectionTitle}>Radiologist Report</h3>
         
         <div className={styles.field}>
            <span className={styles.label}>Conclusion</span>
            <p className={styles.highlightBox}>{mockExam.conclusion}</p>
         </div>

         {mockExam.radiologistNotes && (
            <div className={styles.field} style={{marginTop: '1rem'}}>
               <span className={styles.label}>Notes</span>
               <p className={styles.text}>{mockExam.radiologistNotes}</p>
            </div>
         )}
      </div>

      <div className={styles.footer}>
         <button className={styles.primaryButton}>Open in DICOM Viewer</button>
      </div>

    </BasicOverlay>
  );
}