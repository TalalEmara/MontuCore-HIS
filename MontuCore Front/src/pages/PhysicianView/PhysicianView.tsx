import React, { useState } from "react";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import ProfileCard from "../../components/level-1/userProfileCard/userProfileCard";
import TopBar from "../../components/level-1/TopBar/TopBar";
import styles from "./PhysicianView.module.css";
import physicianProfile from "../../assets/images/physician.webp";
import { usePhysicianDashboard } from "../../hooks/usePhysicianDashboard";
import { Link } from "@tanstack/react-router"; // or 'react-router-dom' depending on your setup
import Pagination from "../../components/level-0/Pagination/Pagination";
import { useAuth } from "../../context/AuthContext";
import { useCancelAppointment, useRescheduleAppointment } from "../../hooks/useAppointments";
import BasicOverlay from "../../components/level-0/Overlay/BasicOverlay";
import Button from "../../components/level-0/Button/Bottom";
import { Calendar, X, Pencil } from "lucide-react";
import CreateCase from "../../components/level-1/CreateCase/CreateCase";

const PhysicianView: React.FC = () => {
  const { user } = useAuth();
  const rescheduleMutation = useRescheduleAppointment();
  const cancelMutation = useCancelAppointment();

  // [NEW] State for Reschedule Modal
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [newDate, setNewDate] = useState<string>("");

  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);
  const [activeAppointmentForCase, setActiveAppointmentForCase] = useState<any>(null);

  const physicianData = {
    fullName: "Olivia Black",
    id: 2,
    email: "olivia@physician.com",
    role: "physician"
  };

  const [currentPage, setPage] = useState(1);
  const totalPages = 3; 

  // 1. Destructure isError, error, and refetch from the hook
  const { dashboard, isLoading, isError, error, refetch } = usePhysicianDashboard(
    user?.id || 0, 
    currentPage, 
    4
  );

  // Local state (Static data)
  const [physioNotes] = useState([
    { athleteName: "Cristiano Ronaldo", note: "Mild fatigue, monitor next session" },
    { athleteName: "Mohamed Salah", note: "Slight hamstring tightness" },
    { athleteName: "Neymar", note: "Knee warm-up needed before training" },
    { athleteName: "Leo", note: "Reported minor ankle discomfort" },
  ]);

  const profileStats = { id: user?.id, role: "Physician" };
  const profileImage = physicianProfile;
  // [NEW] Handle Cancel
  const handleCancel = (appointmentId: number) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      cancelMutation.mutate(appointmentId);
    }
  };

  // [NEW] Open Reschedule Modal
  const openRescheduleModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setNewDate(""); // Reset date input
    setIsRescheduleOpen(true);
  };

  // [NEW] Submit Reschedule
  const handleRescheduleSubmit = () => {
    if (!selectedAppointment || !newDate) return;

    // Ensure we have the correct IDs. 
    // For physician view, clinicianId is the user, athleteId is in the appointment object
    const athleteId = selectedAppointment.athleteId || selectedAppointment.athlete?.id;
    const clinicianId = user?.id;

    if (!athleteId || !clinicianId) {
        console.error("Missing ID information for reschedule");
        return;
    }

    rescheduleMutation.mutate({
      appointmentId: selectedAppointment.id,
      athleteId: athleteId,
      clinicianId: clinicianId,
      scheduledAt: new Date(newDate).toISOString(),
      diagnosisNotes: selectedAppointment.diagnosisNotes,
      height: selectedAppointment.height,
      weight: selectedAppointment.weight
    });

    setIsRescheduleOpen(false);
  };
  return (
    <div className={styles.physicianViewerContainer}>
      {/* [NEW] Reschedule Overlay */}
      <BasicOverlay 
        isOpen={isRescheduleOpen} 
        onClose={() => setIsRescheduleOpen(false)}
        title="Reschedule Appointment"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
          <p style={{ margin: 0 }}>
            Rescheduling appointment for <strong>{selectedAppointment?.athlete?.fullName}</strong>.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>Select New Date & Time</label>
            <input 
              type="datetime-local" 
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button 
              variant="secondary" 
              onClick={() => setIsRescheduleOpen(false)}
              height="35px"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleRescheduleSubmit}
              height="35px"
            >
              Confirm
            </Button>
          </div>
        </div>
      </BasicOverlay>
      <CreateCase 
      isOpen={isCreateCaseOpen} 
      onClose={() => setIsCreateCaseOpen(false)} 
      initialAthlete={activeAppointmentForCase?.athlete} 
      appointmentId={activeAppointmentForCase?.id}
    />

      <div className={styles.physicianMainContent}>
        <TopBar Name={`${user?.fullName || 'Physician'}`} Role={user?.role || 'Clinician'} />

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
                   
                {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} /> 
                )}

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

               {dashboard?.todaysAppointments.appointments.map((appointment: any, idx: number) => {
                const appointmentDate = new Date(appointment.scheduledAt);
                const now = new Date();
                
                const diffInMinutes = (appointmentDate.getTime() - now.getTime()) / 60000;
                const isClose = diffInMinutes <= 10 && diffInMinutes > -10;

                const currentStatus = appointment.status?.toLowerCase();
                const showActions = currentStatus !== 'completed' && currentStatus !== 'cancelled';

                return (
                  <div key={idx} className={styles.scheduleRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={styles.scheduleInfo}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className={styles.athleteName}>
                          {appointment.athlete.fullName}
                        </span>
                        <span className={styles.appointmentTime}>
                          {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {showActions && (
                          <>
                            {isClose && (
                              <div onClick={() => {
                                  setActiveAppointmentForCase(appointment); 
                                  setIsCreateCaseOpen(true); 
                                }}>
                                <Button variant="secondary" height="28px" width="30px">
                                  <Pencil size={14} />
                                </Button>
                              </div>
                            )}

                            <div onClick={() => openRescheduleModal(appointment)}>
                              <Button variant="secondary" height="28px" width="30px">
                                <Calendar size={14} />
                              </Button>
                            </div>
                            
                            <div onClick={() => handleCancel(appointment.id)}>
                              <Button variant="secondary" height="28px" width="30px">
                                <X size={14} />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>

                      <div className={`${styles.status} ${styles[appointment.status]}`}>
                        {appointment.status}
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>
                <div className={styles.cardFooter}>
                {totalPages > 1 && (
                 <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
                )}
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
                  {/* Handle empty state */}
                  {(!dashboard?.physioRiskNotes || dashboard.physioRiskNotes.length === 0) && (
                     <div className={styles.emptyState}>No risk notes reported</div>
                  )}

                  {/* Map over the parsed physioRiskNotes from the hook */}
                  {dashboard?.physioRiskNotes?.map((noteItem: any, idx: number) => (
                    <div key={idx} className={styles.physioNoteRow}>
                      <div className={styles.athleteName}>{noteItem.athleteName}</div>
                      <div className={styles.physioNote} title={noteItem.note}>
                        {noteItem.note}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.cardFooter}>
                   {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
                   )}
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
                   {totalPages > 1 && (
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={(page) => setPage(page)} 
                /> )}
                
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