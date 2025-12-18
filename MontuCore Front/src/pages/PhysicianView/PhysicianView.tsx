import React, { useState } from "react";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import ProfileCard from "../../components/level-1/userProfileCard/userProfileCard";
import TopBar from "../../components/level-1/TopBar/TopBar";
import styles from "./PhysicianView.module.css";
import physicianProfile from '../../assets/images/physician.webp';
import { email } from "zod";
import { usePhysicianDashboard } from "../../hooks/usePhysicianDashboard";

const PhysicianView: React.FC = () => {
  const physicianData = {
    fullName: "Olivia Black",
    id: 2,
    email: "olivia@physician.com"
  }
  const[cuurentPage,setPage] = useState(1)
  const { 
    dashboard, 
    message, 
    isLoading, 
    isPlaceholderData 
  } = usePhysicianDashboard(physicianData.id, cuurentPage, 4);


  const [urgentCases] = useState([
    { id: "1", athleteName: "Cristiano Ronaldo", injury: "Knee Strain", priority: "urgent" },
    { id: "2", athleteName: "Mohamed Salah", injury: "Hamstring Injury", priority: "high" },
    { id: "3", athleteName: "Neymar", injury: "Ankle Sprain", priority: "medium" },
    { id: "4", athleteName: "Leo", injury: "Muscle Fatigue", priority: "medium" },
    { id: "5", athleteName: "Messi", injury: "Back Pain", priority: "high" },
    { id: "6", athleteName: "Famous", injury: "Shoulder Strain", priority: "low" },
  ]);

  // const [todaySchedule] = useState([
  //   { athleteName: "Cristiano Ronaldo", type: "Follow-up", status: "completed" },
  //   { athleteName: "Mohamed Salah", type: "Assessment", status: "upcoming" },
  //   { athleteName: "Neymar", type: "Rehab", status: "completed" },
  //   { athleteName: "Leo", type: "Checkup", status: "upcoming" },
  //   { athleteName: "Messi", type: "Physio", status: "completed" },
  //   { athleteName: "Famous", type: "Treatment", status: "upcoming" },
  // ]);

  const [physioNotes] = useState([
    { athleteName: "Cristiano Ronaldo", note: "Mild fatigue, monitor next session" },
    { athleteName: "Mohamed Salah", note: "Slight hamstring tightness" },
    { athleteName: "Neymar", note: "Knee warm-up needed before training" },
    { athleteName: "Leo", note: "Reported minor ankle discomfort" },
  ]);

  const [athleteComplaints] = useState([
    { athleteName: "Cristiano Ronaldo", complaint: "Knee pain before training", caseLink: "#" },
    { athleteName: "Mohamed Salah", complaint: "Muscle tightness after match", caseLink: "#" },
    { athleteName: "Neymar", complaint: "Ankle discomfort", caseLink: "#" },
    { athleteName: "Leo", complaint: "Back soreness", caseLink: "#" },
  ]);

  const profileStats = { age: "30 years", role: "Physician" };
  const profileImage = physicianProfile;

  return (
    <div className={styles.physicianViewerContainer}>
      <div className={styles.physicianMainContent}>
        <TopBar Name="Dr. Sarah" Role="Sports Physician" />

        <div className={styles.physicianDashboardGrid}>
          <ProfileCard 
            profileImage={profileImage}
            stats={profileStats}
            height="320px" 
            minHeight="320px" 
          />

          <AdjustableCard className={styles.urgentCasesCard} height="320px" minHeight="320px">
            <div className={styles.urgentContainer}>
              <div className={styles.appointmentsHeader}>
                <h2 className={styles.appointmentsTitle}>Urgent Cases</h2>
              </div>
              <div className={styles.casesList}>
                {urgentCases.map(({ id, athleteName, injury, priority }) => (
                  <div key={id} className={`${styles.caseRow} ${styles[priority]}`}>
                    <div className={styles.caseName}>{athleteName}</div>
                    <div className={styles.caseInjury}>{injury}</div>
                  </div>
                ))}
              </div>
            </div>
          </AdjustableCard>

          <AdjustableCard className={styles.todayScheduleCard} height="320px" minHeight="320px">
            <div className={styles.scheduleContainer}>
              <div className={styles.scheduleHeader}>
                <h2 className={styles.scheduleTitle}>Today's Schedule</h2>
              </div>
              <div className={styles.scheduleList}>
                {dashboard?.todaysAppointments.appointments.map((appointment, idx) => (
                  <div key={idx} className={styles.scheduleRow}>
                    <div className={styles.scheduleInfo}>
                      {/* <span className={styles.athleteName}>{appointment.athlete.fullName}</span> - <span>{type}</span> */}
                      <span className={styles.athleteName}>{appointment.athlete.fullName}</span>
                    </div>
                    <div className={`${styles.status} ${styles[appointment.status]}`}>{appointment.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </AdjustableCard>

          <AdjustableCard className={styles.physioNotesCard} height="280px" minHeight="280px">
            <div className={styles.physioNotesContainer}>
              <div className={styles.physioNotesHeader}>
                <h2 className={styles.physioNotesTitle}>Physio Risk Notes</h2>
              </div>
              <div className={styles.physioNotesList}>
                {physioNotes.map(({ athleteName, note }, idx) => (
                  <div key={idx} className={styles.physioNoteRow}>
                    <div className={styles.athleteName}>{athleteName}</div>
                    <div className={styles.physioNote}>{note}</div>
                  </div>
                ))}
              </div>
            </div>
          </AdjustableCard>

          <AdjustableCard className={styles.athleteHandlingCard} height="280px" minHeight="280px">
            <div className={styles.athleteHandlingContainer}>
              <div className={styles.athleteHandlingHeader}>
                <h2 className={styles.athleteHandlingTitle}>Athlete Complaints</h2>
              </div>
              <div className={styles.athleteHandlingList}>
                {athleteComplaints.map(({ athleteName, complaint, caseLink }, idx) => (
                  <div key={idx} className={styles.athleteHandlingRow}>
                    <div className={styles.athleteName}>{athleteName}</div>
                    <div className={styles.athleteComplaint}>{complaint}</div>
                    <a href={caseLink} className={styles.caseButton}>View Case</a>
                  </div>
                ))}
              </div>
            </div>
          </AdjustableCard>

        </div>
      </div>
    </div>
  );
};

export default PhysicianView;
