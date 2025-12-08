import React, { useState } from "react";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import ProfileCard from "../../components/level-1/userProfileCard/userProfileCard";
import TopBar from "../../components/level-1/TopBar/TopBar";
import styles from "./PhysicianView.module.css";
import physicianProfile from '../../assets/images/physician.webp';

const PhysicianView: React.FC = () => {
  const [urgentCases] = useState([
    { id: "1", athleteName: "Cristiano Ronaldo", injury: "Knee Strain", priority: "urgent" },
    { id: "2", athleteName: "Mohamed Salah", injury: "Hamstring Injury", priority: "high" },
    { id: "3", athleteName: "Neymar", injury: "Ankle Sprain", priority: "medium" },
    { id: "4", athleteName: "Leo", injury: "Muscle Fatigue", priority: "medium" },
    { id: "5", athleteName: "Messi", injury: "Back Pain", priority: "high" },
    { id: "6", athleteName: "Famous", injury: "Shoulder Strain", priority: "low" },
  ]);

  const [todaySchedule] = useState([
    { athleteName: "Cristiano Ronaldo", type: "Follow-up", status: "completed" },
    { athleteName: "Mohamed Salah", type: "Assessment", status: "upcoming" },
    { athleteName: "Neymar", type: "Rehab", status: "completed" },
    { athleteName: "Leo", type: "Checkup", status: "upcoming" },
    { athleteName: "Messi", type: "Physio", status: "completed" },
    { athleteName: "Famous", type: "Treatment", status: "upcoming" },
  ]);


  const profileStats = {
    age: "30 years",
    role: "Physician",
  };
  const profileImage = physicianProfile;

  return (
    <div className={styles.physicianViewerContainer}>
      <div className={styles.physicianMainContent}>
        <TopBar 
          Name="Dr. Sarah"
          Role="Sports Physician"
        />

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
                {todaySchedule.map(({ athleteName, type, status }, idx) => (
                  <div key={idx} className={styles.scheduleRow}>
                    <div className={styles.scheduleInfo}>
                      <span className={styles.athleteName}>{athleteName}</span>  -  <span >{type}</span>
                    </div>
                    <div className={`${styles.status} ${styles[status]}`}>
                      {status}
                    </div>
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
