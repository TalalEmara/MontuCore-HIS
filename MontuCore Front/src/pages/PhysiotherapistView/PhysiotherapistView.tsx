import React, { useState, useMemo, useCallback } from "react";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import ProfileCard from "../../components/level-1/userProfileCard/userProfileCard";
import TopBar from "../../components/level-1/TopBar/TopBar";
import styles from "./PhysiotherapistView.module.css";
import physiotherapistProfile from "../../assets/images/physiotherapist.webp";
import Pagination from "../../components/level-0/Pagination/Pagination";
import RiskNotesPanel from "../../components/level-1/RiskNotesPanel/RiskNotesPanel"; 
import { usePhysiotherapistDashboard } from "../../hooks/usePhysioDashboard";
import { useAuth } from "../../context/AuthContext";

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
  const { user } = useAuth();
  const [isRiskModalOpen, setRiskModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;
 
  
 const { data, isLoading, error } = usePhysiotherapistDashboard(user?.id || 0);

  
  const activeRehabCases = useMemo(() => {
    if (!data || !data.data) return []; // Guard against loading/undefined state

    return data.data.activeCases.map((c) => ({
      id: c.id.toString(),            // Convert number ID to string
      athleteName: c.athlete.fullName,
      session: c.diagnosisName,       // Map 'diagnosisName' to 'session'
      severity: c.severity as Severity, // Cast string to Severity type
    }));
  }, [data]);

  const todayAppointments = useMemo(() => {
    if (!data || !data.data) return []; // Handle loading/error state
    
    return data.data.todaysAppointments.map((app) => ({
      athleteName: app.athlete.fullName,
      time: new Date(app.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: app.status.toLowerCase(),
    }));
  }, [data]);


  const severityLevels: Severity[] = ["MILD", "MODERATE", "SEVERE", "CRITICAL"];

  
  const PatientList = useMemo(() => [
    { label: "Cristiano Ronaldo", value: "1" },
    { label: "Mohamed Salah", value: "2" },
    { label: "Neymar", value: "3" },
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

  const handleAddRiskNotes = useCallback(() => {
    setRiskModalOpen(true);
  }, []);

  return (
    <div className={styles.physiotherapistViewerContainer}>
      <div className={styles.physiotherapistMainContent}>
       <TopBar Name={user?.fullName || "Physio"} Role="Sports Physiotherapist" />

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
              <div className={styles.cardFooter}>
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={(page) => setCurrentPage(page)} 
              /> )}
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
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                ))}
              </div>
              </div>
            </AdjustableCard>
          </div>
        </div>
      </div>

      <RiskNotesPanel 
        isOpen={isRiskModalOpen} 
        onClose={() => setRiskModalOpen(false)} 
        patients={PatientList}
      />
    </div>
  );
};


const SeverityColumn = React.memo<{
  severity: Severity;
  cases: RehabCase[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}>(({ severity, cases, currentPage, totalPages, onPageChange }) => { // 2. DESTRUCTURE THEM HERE
  return (
    <div className={styles.severityColumn} data-severity={severity}>
      <div className={styles.severityHeader}>
        <h3 className={styles.severityTitle}>{severity}</h3>
        <span className={styles.caseCount}>{cases.length}</span>
      </div>

      <div className={styles.casesList}>
        {cases.map((rehabCase) => (
          <CaseCard key={rehabCase.id} rehabCase={rehabCase} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.cardFooter}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
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