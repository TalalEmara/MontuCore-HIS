import React, { useState } from "react";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import ProfileCard from "../../components/level-1/userProfileCard/userProfileCard";
import TopBar from "../../components/level-1/TopBar/TopBar";
import styles from "./PhysicianView.module.css";
import physicianProfile from "../../assets/images/physician.webp";
import { usePhysicianDashboard } from "../../hooks/usePhysicianDashboard";
import { Link } from "@tanstack/react-router"; // or 'react-router-dom' depending on your setup
import Pagination from "../../components/level-0/Pagination/Pagination";

const PhysicianView: React.FC = () => {
  const physicianData = {
    fullName: "Olivia Black",
    id: 2,
    email: "olivia@physician.com",
    role: "physician"
  };

  const [currentPage, setPage] = useState(1);
  const totalPages = 3; 

  // 1. Destructure isError, error, and refetch from the hook
  const { 
    dashboard, 
    message, 
    isLoading, 
    isError, 
    error,
    refetch // Useful for a "Try Again" button
  } = usePhysicianDashboard(physicianData.id, currentPage, 4);

  // Local state (Static data)
  const [physioNotes] = useState([
    { athleteName: "Cristiano Ronaldo", note: "Mild fatigue, monitor next session" },
    { athleteName: "Mohamed Salah", note: "Slight hamstring tightness" },
    { athleteName: "Neymar", note: "Knee warm-up needed before training" },
    { athleteName: "Leo", note: "Reported minor ankle discomfort" },
  ]);

  const profileStats = { id:physicianData.id, role: "Physician" };
  const profileImage = physicianProfile;

  return (
    <div className={styles.physicianViewerContainer}>
      <div className={styles.physicianMainContent}>
        <TopBar Name={`Dr. ${physicianData.fullName}`} Role={physicianData.role} />

        {/* 2. LOADING STATE */}
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading Dashboard...</p>
          </div>
        ) : isError ? (
          /* 3. ERROR STATE */
          // needs to be a component
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>
              Unable to load dashboard data.
            </p>
            <p className={styles.errorDetail}>
              {error?.message || "Server connection failed"}
            </p>
            <button onClick={() => refetch()} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        ) : (
          /* 4. SUCCESS STATE (Your existing Grid) */
          <div className={styles.physicianDashboardGrid}>
            <ProfileCard
              profileImage={profileImage}
              stats={profileStats}
              height="320px"
              minHeight="320px"
            />

            <AdjustableCard
              className={styles.urgentCasesCard}
              height="320px"
              minHeight="320px"
            >
              <div className={styles.urgentContainer}>
                <div className={styles.appointmentsHeader}>
                  <h2 className={styles.appointmentsTitle}>Critical Cases</h2>
                </div>
                <div className={styles.casesList}>
                  {/* Optional: Handle empty state if array is empty */}
                  {dashboard?.criticalCases.cases.length === 0 && (
                    <div className={styles.emptyState}>No critical cases</div>
                  )}
                  
                  {dashboard?.criticalCases.cases.map((criticalCase) => (
                    <div
                      key={criticalCase.id}
                      className={`${styles.caseRow}`}
                    >
                      <div className={styles.caseName}>
                        {criticalCase.athlete.fullName}
                      </div>
                      <div className={styles.caseInjury}>
                        {criticalCase.diagnosisName}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.cardFooter}>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
              </div>
              </div>
            </AdjustableCard>

            <AdjustableCard
              className={styles.todayScheduleCard}
              height="320px"
              minHeight="320px"
            >
              <div className={styles.scheduleContainer}>
                <div className={styles.scheduleHeader}>
                  <h2 className={styles.scheduleTitle}>Today's Schedule</h2>
                </div>
                <div className={styles.scheduleList}>
                  {dashboard?.todaysAppointments.appointments.length === 0 && (
                    <div className={styles.emptyState}>No appointments today</div>
                  )}

                  {dashboard?.todaysAppointments.appointments.map(
                    (appointment, idx) => (
                      <div key={idx} className={styles.scheduleRow}>
                        <div className={styles.scheduleInfo}>
                          <span className={styles.athleteName}>
                            {appointment.athlete.fullName}
                          </span>
                        </div>
                        <div
                          className={`${styles.status} ${
                            styles[appointment.status]
                          }`}
                        >
                          {appointment.status}
                        </div>
                      </div>
                    )
                  )}
                </div>
                <div className={styles.cardFooter}>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
              </div>
              </div>
            </AdjustableCard>

            <AdjustableCard
              className={styles.physioNotesCard}
              height="280px"
              minHeight="280px"
            >
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
                <div className={styles.cardFooter}>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
              </div>
              </div>
            </AdjustableCard>

            <AdjustableCard
              className={styles.athleteHandlingCard}
              height="280px"
              minHeight="280px"
            >
              <div className={styles.athleteHandlingContainer}>
                <div className={styles.athleteHandlingHeader}>
                  <h2 className={styles.athleteHandlingTitle}>
                    Athlete Complaints
                  </h2>
                </div>
                <div className={styles.athleteHandlingList}>
                  {dashboard?.activeCases.cases.map((medicalCase, idx) => (
                    <div key={idx} className={styles.athleteHandlingRow}>
                      <div className={styles.athleteName}>
                        {medicalCase.athlete.fullName}
                      </div>
                      <div className={styles.athleteComplaint}>
                        {medicalCase.diagnosisName}
                      </div>
                      <Link
                        to={`/cases/${medicalCase.id}`}
                        className={styles.caseButton}
                      >
                        View Case
                      </Link>
                    </div>
                  ))}
                </div>
                <div className={styles.cardFooter}>
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={(page) => setPage(page)} 
                />
              </div>
              </div>
            </AdjustableCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhysicianView;