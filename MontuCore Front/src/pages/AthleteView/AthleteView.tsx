import { useState } from "react";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import TopBar from "../../components/level-1/TopBar/TopBar";
import Button from "../../components/level-0/Button/Bottom";
import ProfileCard from "../../components/level-1/userProfileCard/userProfileCard";
import bookAppointment from "../../assets/images/bookAppointment.webp";
import athleteProfile from "../../assets/images/Cristiano Ronaldo.webp";
import Pagination from "../../components/level-0/Pagination/Pagination";
import "./AthleteView.css";
import { useAthleteDashboard } from "../../hooks/useAthleteDashboard";
import BookingPanel from "../../components/level-1/BookingPanel/BookingPanel";
import { useAuth } from "../../context/AuthContext";
import { X, Calendar } from "lucide-react";
import { useCancelAppointment, useRescheduleAppointment } from "../../hooks/useAppointments";
import BasicOverlay from "../../components/level-0/Overlay/BasicOverlay";

function AthleteView() {
  const [activeTab, setActiveTab] = useState<"reports" | "prescriptions" | "imaging" | "Lab tests">("reports");
  const [currentPage, setPage] = useState(1);
  const [isBooking, setIsBooking] = useState<boolean>(false)

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [newDate, setNewDate] = useState<string>("");

  const { user, profile } = useAuth();

  const rescheduleMutation = useRescheduleAppointment();
  const cancelMutation = useCancelAppointment();


  const baseAthleteData = {
    fullName: user?.fullName || "Not logged",
    position: profile?.position || "Athlete",
    id: user?.id || 0,
    jerseyNumber: profile?.jerseyNumber || 7,
  };

  // Fetch Data
  const { dashboard, isLoading, refetch } = useAthleteDashboard(
    baseAthleteData.id,
    currentPage,
    1,
    activeTab
  );

  // Merge Static Data with Dynamic Vitals
  const athleteData = {
    ...baseAthleteData,
    height: isLoading
      ? "..."
      : (dashboard?.latestVitals?.height ?? "N/A"), // Returns number or "N/A"

    weight: isLoading
      ? "..."
      : (dashboard?.latestVitals?.weight ?? "N/A"), // Returns number or "N/A"

    status: isLoading
      ? "Loading..."
      : (dashboard?.latestVitals?.status == "RECOVERED" ? "Fit" : dashboard?.latestVitals?.status == "ACTIVE" ? "Injured" : "Unknown"),
  };

  // [UPDATED] Map appointments to include raw data for rescheduling
  // Removed the duplicate 'appointments' declaration that was here previously
  const appointments = dashboard?.upcomingAppointments.appointments.map(
    (appt, indx) => ({
      displayId: indx + 1,
      clinicianName: appt.clinician?.fullName || "Unassigned",
      dateFormatted: new Date(appt.scheduledAt).toLocaleDateString(),
      raw: appt // Store full object for logic
    })
  ) || [];

  const cases = dashboard?.report?.cases?.map((report, indx) => [
    indx + 1,
    report.diagnosisName,
    new Date(report.injuryDate).toLocaleDateString(),
  ]) || []; // Added fallback array

  const prescriptions = dashboard?.prescriptions?.treatments?.map((treatment, indx) => [
    indx + 1,
    treatment.description,
    new Date(treatment.date).toLocaleDateString(),
  ]) || [];

  const images = dashboard?.imaging?.exams?.map((exam, indx) => [
    indx + 1,
    `${exam.bodyPart}-${exam.modality}`,
    new Date(exam.performedAt || "").toLocaleDateString(),
    exam.status
  ]) || [];

  const labTests = dashboard?.tests?.labTests?.map((test, indx) => [
    indx + 1,
    `${test.testName}-${test.category}`,
    new Date(test.sampleDate).toLocaleDateString(),
    test.status
  ]) || [];

  const medicalRecords = {
    reports: cases,
    prescriptions: prescriptions,
    imaging: images,
    "Lab tests": labTests
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setPage(1);
  };
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

    // 1. Get athleteId from the current user's data (athleteData.id)
    // 2. Get clinicianId from the nested clinician object in selectedAppointment
    // const clinicianId = selectedAppointment.clinician?.id;
    const clinicianId = 2;
    
    if (!clinicianId) {
        console.error("Cannot reschedule: Clinician ID missing");
        return;
    }

    rescheduleMutation.mutate({
      appointmentId: selectedAppointment.id,
      athleteId: athleteData.id, 
      clinicianId: clinicianId,
      scheduledAt: new Date(newDate).toISOString(),
      diagnosisNotes: selectedAppointment.diagnosisNotes,
      height: selectedAppointment.height,
      weight: selectedAppointment.weight
    });

    setIsRescheduleOpen(false);
  };
  const totalPages = (() => {
    if (!dashboard) return 1;
    switch (activeTab) {
      case "prescriptions":
        return dashboard.prescriptions?.pagination?.totalPages || 1;
      case "imaging":
        return dashboard.imaging?.pagination?.totalPages || 1;
      case "Lab tests":
        return dashboard.tests?.pagination?.totalPages || 1;
      case "reports":
        return (dashboard.report as any)?.pagination?.totalPages || 1;
      default:
        return 1;
    }
  })();

  return (
    <div className="athlete-viewer-container">
      <BookingPanel isOpen={isBooking} onClose={function (): void {
        setIsBooking(false);
        refetch(); // Fixed: Added parenthesis to actually call the function
      }} athleteId={athleteData.id} />
      {/* [NEW] Reschedule Overlay */}
      <BasicOverlay
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title="Reschedule Appointment"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
          <p style={{ margin: 0 }}>
            Rescheduling appointment with <strong>{selectedAppointment?.clinician?.fullName}</strong>.
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
              Confirm Reschedule
            </Button>
          </div>
        </div>
      </BasicOverlay>

      <div className="athlete-main-content">
        <TopBar
          Name={athleteData.fullName}
          Role={athleteData.position}
          jerseyNumber={athleteData.jerseyNumber}
        />

        <div className="athlete-dashboard-grid">
          <ProfileCard
            className="athlete-profile-card"
            profileImage={athleteProfile}
            stats={{
              id: athleteData.id,
              age: user?.dateOfBirth
                ? Math.floor((new Date().getTime() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) + " years"
                : "N/A",
              // height: athleteData.height + " cm",
              // weight: athleteData.weight + " kg",
              status: athleteData.status,
              role: athleteData.position,
              jersey: `#${athleteData.jerseyNumber}`,
            }}
          />

          <AdjustableCard className="booking-card-wrapper" height="100%">
            <div
              className="book-appointment"
              style={{
                background: `linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.45)), url(${bookAppointment})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="book-content">
                <div className="book-title">Book Your Next Appointment</div>
                <div className="booking-description">
                  Schedule training sessions, medical checkups, or consultations
                </div>
                <Button onClick={() => setIsBooking(true)} variant="primary" height="35px">
                  SCHEDULE NOW ➜
                </Button>
              </div>
            </div>
          </AdjustableCard>

          <AdjustableCard className="next-appointments-card" height="100%">
            <div className="next-container">
              <div className="next-header">
                <h2 className="next-title">Next Appointments</h2>
              </div>

              {/* Fixed: Removed duplicate 'appointments-list' div wrapper */}
              <div className="appointments-list">
                {appointments.length > 0 ? (
                  appointments.map((appt, idx) => (
                    <div key={idx} className="appointment-item">
                      {/* Use displayId from the object */}
                      <div className="appointment-index">{appt.displayId}</div>
                      <div className="appointment-container">
                        <div className="appointment-details">
                          <div className="appointment-clinician">{appt.clinicianName}</div>
                          <div className="appointment-date">{appt.dateFormatted}</div>
                        </div>
                        <div className="appointment-actions">
                          {/* [UPDATED] Reschedule Button */}
                          <div onClick={() => openRescheduleModal(appt.raw)}>
                            <Button variant="secondary" height="30px">
                              <Calendar size={16} />
                            </Button>
                          </div>
                          {/* [UPDATED] Cancel Button */}
                          <div onClick={() => handleCancel(appt.raw.id)}>
                            <Button variant="secondary" height="30px">
                              <X size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-appointments">No upcoming appointments</div>
                )}
              </div>
            </div>
          </AdjustableCard>

          <AdjustableCard className="medical-records-card" height="100%">
            <div className="medical-records-container">
              <div className="medical-records-header">
                <h2 className="medical-records-title">Medical Records</h2>
              </div>

              <div className="medical-records-tabs">
                {["reports", "prescriptions", "imaging", "Lab tests"].map((tab) => (
                  <div
                    key={tab}
                    className={`medical-records-tab ${activeTab === tab ? "active" : ""}`}
                    onClick={() => handleTabChange(tab as typeof activeTab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </div>
                ))}
              </div>

              <div className="medical-records-content">
                <div className="records-list">
                  {medicalRecords[activeTab]?.map((record, idx) => (
                    <div key={idx} className="record-item">
                      <div className="record-number">{record[0]}</div>

                      <div className="record-main-info">
                        <div className="record-details">
                          <div className="record-name">{record[1]}</div>
                          <div className="record-date">{record[2]}</div>
                        </div>

                        {(activeTab === "imaging" || activeTab === "Lab tests") && record[3] && (
                          <div className={`status-badge ${String(record[3]).toLowerCase()}`}>
                            {record[3]}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-footer">
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setPage(page)}
                  />)}
              </div>
            </div>
          </AdjustableCard>
        </div>
      </div>
    </div>
  );
}

export default AthleteView;