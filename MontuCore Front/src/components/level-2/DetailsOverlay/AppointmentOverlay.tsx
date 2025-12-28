import React from 'react';
import BasicOverlay from '../../level-0/Overlay/BasicOverlay';
import styles from './Details.module.css';
import { StatusBadge } from '../../level-0/Badge/Badge';
import { type Appointment } from '../../../types/models';

// Default mock for fallback if no appointment is passed
const defaultMockAppointment: Appointment = {
  id: 0,
  athleteId: 0,
  clinicianId: 0,
  scheduledAt: new Date().toISOString(),
  status: 'SCHEDULED',
  athlete: { id: 0, fullName: "Unknown Athlete", email: "" },
  clinician: { id: 0, fullName: "Unknown Clinician", email: "" }
};

interface AppointmentOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
}

export default function AppointmentOverlay({ isOpen, onClose, appointment }: AppointmentOverlayProps) {
  // Use passed appointment or fallback to default
  const data = appointment || defaultMockAppointment;

  return (
    <BasicOverlay isOpen={isOpen} onClose={onClose} title="Appointment Details">
      
      {/* Header Info */}
      <div className={styles.section}>
         <div className={styles.row}>
            <div>
              <span className={styles.label}>Participants</span>
              <div className={styles.valueLarge}>
                {data.clinician?.fullName || 'Unknown Clinician'}
              </div>
              <div className={styles.text}>
                 w/ {data.athlete?.fullName || 'Unknown Athlete'}
              </div>
            </div>
            <StatusBadge status={data.status} />
         </div>
      </div>

      {/* Timeline & Vitals */}
      <div className={styles.section}>
         <div className={styles.grid}>
            <div className={styles.field}>
               <span className={styles.label}>Scheduled</span>
               <span>{new Date(data.scheduledAt).toLocaleString()}</span>
            </div>
            {/* Display Vitals if available */}
            {(data.height || data.weight) && (
               <div className={styles.field}>
                  <span className={styles.label}>Vitals</span>
                  <span>
                     {data.height ? `${data.height} cm` : ''} 
                     {data.height && data.weight ? ' / ' : ''}
                     {data.weight ? `${data.weight} kg` : ''}
                  </span>
               </div>
            )}
         </div>
      </div>

      {/* Medical Notes */}
      <div className={styles.section}>
         <h3 className={styles.sectionTitle}>Medical Notes</h3>
         
         {data.diagnosisNotes ? (
             <div className={styles.field}>
                <span className={styles.label}>Diagnosis & Observations</span>
                <p className={styles.highlightBox}>{data.diagnosisNotes}</p>
             </div>
         ) : (
             <p className={styles.text}>No diagnosis notes available.</p>
         )}
      </div>


    </BasicOverlay>
  );
}