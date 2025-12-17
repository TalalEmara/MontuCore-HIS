import React, { useState, useMemo, useCallback } from "react";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import ProfileCard from "../../components/level-1/userProfileCard/userProfileCard";
import TopBar from "../../components/level-1/TopBar/TopBar";
import styles from "./PhysiotherapistView.module.css";
import physiotherapistProfile from "../../assets/images/physiotherapist.webp";

// Import the new component
import RiskNotesPanel from "../../components/level-1/RiskNotesPanel/RiskNotesPanel"; 

type Severity = "MILD" | "MODERATE" | "SEVERE" | "CRITICAL";

interface RehabCase {
  id: string;
  athleteName: string;
  session: string;
  severity: Severity;
}

interface Appointment {
  athleteName: string;
  time: string;
  status: string;
}

const PhysiotherapistView: React.FC = () => {
  // --- State ---
  const [isRiskModalOpen, setRiskModalOpen] = useState(false);
  
  const [activeRehabCases] = useState<RehabCase[]>([
    { id: "1", athleteName: "Cristiano Ronaldo", session: "Ankle", severity: "MILD" },
    { id: "2", athleteName: "Mohamed Salah", session: "Bone", severity: "MODERATE" },
    { id: "3", athleteName: "Neymar Jr", session: "Arm", severity: "SEVERE" },
    { id: "4", athleteName: "Leo Messi", session: "Ankle", severity: "CRITICAL" },
    { id: "5", athleteName: "Cristiano Ronaldo", session: "Bone", severity: "MODERATE" },
    { id: "6", athleteName: "Mohamed Salah", session: "Arm", severity: "MILD" },
    { id: "7", athleteName: "Neymar Jr", session: "Ankle", severity: "SEVERE" },
    { id: "8", athleteName: "Leo Messi", session: "Bone", severity: "CRITICAL" },
    { id: "9", athleteName: "Cristiano Ronaldo", session: "Arm", severity: "MILD" },
    { id: "10", athleteName: "Mohamed Salah", session: "Ankle", severity: "MODERATE" },
    { id: "11", athleteName: "Neymar Jr", session: "Bone", severity: "SEVERE" },
    { id: "12", athleteName: "Leo Messi", session: "Arm", severity: "MILD" },
    { id: "13", athleteName: "Cristiano Ronaldo", session: "Ankle", severity: "MODERATE" },
    { id: "14", athleteName: "Mohamed Salah", session: "Bone", severity: "CRITICAL" },
    { id: "15", athleteName: "Neymar Jr", session: "Arm", severity: "SEVERE" },
    { id: "16", athleteName: "Leo Messi", session: "Ankle", severity: "MILD" },
  ]);

  const [todayAppointments] = useState<Appointment[]>([
    { athleteName: "Cristiano Ronaldo", time: "09:00 AM", status: "completed" },
    { athleteName: "Mohamed Salah", time: "10:30 AM", status: "upcoming" },
    { athleteName: "Neymar", time: "12:00 PM", status: "canceled" },
    { athleteName: "Messi", time: "01:15 PM", status: "upcoming" },
    { athleteName: "Leo Messi", time: "02:00 PM", status: "upcoming" },
    { athleteName: "Mbappe", time: "03:30 PM", status: "completed" },
    { athleteName: "Ronaldo", time: "04:45 PM", status: "upcoming" },
    { athleteName: "Salah", time: "06:00 PM", status: "upcoming" }
  ]);

  const severityLevels: Severity[] = ["MILD", "MODERATE", "SEVERE", "CRITICAL"];

  // --- Memoized Data ---
  
  const PatientList = useMemo(() => [
    { label: "Cristiano Ronaldo", value: "1" },
    { label: "Mohamed Salah", value: "2" },
    { label: "Neymar Jr", value: "3" },
    { label: "Leo Messi", value: "4" },
    { label: "Kylian Mbappe", value: "5" }
  ], []);

  const profileStats = useMemo(() => 
    ({ age: "28 years", role: "Physiotherapist" }), 
    []
  );

  const casesBySeverity = useMemo(() => {
    const grouped: Record<Severity, RehabCase[]> = {
      MILD: [], MODERATE: [], SEVERE: [], CRITICAL: []
    };
    activeRehabCases.forEach(rehabCase => {
      grouped[rehabCase.severity].push(rehabCase);
    });
    return grouped;
  }, [activeRehabCases]);

  // --- Callbacks ---
  const handleAddRiskNotes = useCallback(() => {
    setRiskModalOpen(true);
  }, []);

  return (
    <div className={styles.physiotherapistViewerContainer}>
      <div className={styles.physiotherapistMainContent}>
        <TopBar Name="Mariam Mohamed" Role="Sports Physiotherapist" />

        <div className={styles.physiotherapistDashboardGrid}>
          <ProfileCard
            className={styles.physiotherapistProfileCard}
            profileImage={physiotherapistProfile}
            stats={profileStats}
          />

          <AdjustableCard className={styles.appointmentsCard} height="100%">
            <div className={styles.appointmentsContainer}>
              <div className={styles.appointmentsHeader}>
                <h2 className={styles.appointmentsTitle}>Today's Schedule</h2>
              </div>
              <div className={styles.appointmentsList}>
                {todayAppointments.map((appointment, idx) => (
                  <div 
                    key={`${appointment.athleteName}-${idx}`}
                    className={styles.appointmentRow} 
                    data-status={appointment.status}
                  >
                    <div className={styles.appointmentInfo}>
                      <span className={styles.athleteName}>{appointment.athleteName}</span>
                      <div className={styles.appointmentDetails}>
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                    <div className={`${styles.status} ${styles[appointment.status]}`}>
                      {appointment.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AdjustableCard>

          <div className={styles.activeRehabCard}>
            <AdjustableCard height="100%">
              <div className={styles.rehabContainer}>
                <div className={styles.rehabHeader}>
                  <h2 className={styles.rehabTitle}>Active Rehab Cases</h2>
                  <button 
                    className={styles.addRiskBtn}
                    onClick={handleAddRiskNotes}
                  >
                    ADD RISK NOTES
                  </button>
                </div>

                <div className={styles.severityColumns}>
                  {severityLevels.map(severity => (
                    <SeverityColumn
                      key={severity}
                      severity={severity}
                      cases={casesBySeverity[severity]}
                    />
                  ))}
                </div>
              </div>
            </AdjustableCard>
          </div>
        </div>
      </div>

      {/* Risk Notes Popup Modal - Now using PatientList */}
      <RiskNotesPanel 
        isOpen={isRiskModalOpen} 
        onClose={() => setRiskModalOpen(false)} 
        patients={PatientList}
      />
    </div>
  );
};

// --- Sub-Components ---

const SeverityColumn = React.memo<{
  severity: Severity;
  cases: RehabCase[];
}>(({ severity, cases }) => {
  return (
    <div className={styles.severityColumn} data-severity={severity}>
      <div className={styles.severityHeader}>
        <h3 className={styles.severityTitle}>{severity}</h3>
        <span className={styles.caseCount}>{cases.length}</span>
      </div>

      <div className={styles.casesList}>
        {cases.map(rehabCase => (
          <CaseCard key={rehabCase.id} rehabCase={rehabCase} />
        ))}
      </div>
    </div>
  );
});

SeverityColumn.displayName = "SeverityColumn";

const CaseCard = React.memo<{ rehabCase: RehabCase }>(({ rehabCase }) => {
  return (
    <div className={styles.caseCard}>
      <div className={styles.caseName}>{rehabCase.athleteName}</div>
      <div className={styles.caseSession}>{rehabCase.session}</div>
    </div>
  );
});

CaseCard.displayName = "CaseCard";

export default PhysiotherapistView;