import { use, useState } from "react";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import TopBar from "../../components/level-1/TopBar/TopBar";
import Button from "../../components/level-0/Button/Bottom";
import ProfileCard from "../../components/level-1/userProfileCard/userProfileCard";
import bookAppointment from "../../assets/images/bookAppointment.webp";
import athleteProfile from "../../assets/images/Cristiano Ronaldo.webp";

import "./AthleteView.css";
import { useAthleteDashboard } from "../../hooks/useAthleteDashboard";
import List from "../../components/level-0/List/List";

function AthleteView() {
  const [activeTab, setActiveTab] = useState<"reports" | "prescriptions" | "imaging" | "Lab tests">("reports");
  const [currentPage, setPage] = useState(1);

  const athleteData = {
    fullName: "Cristiano Ronaldo",
    position: "Forward",
    id: 3,
    jerseyNumber: 7,
    height: 185, //cm
    weight: 72, //Kg
    status: "Fit",
  };
  const { dashboard, message, isLoading, isError, error } = useAthleteDashboard(
    athleteData.id,
    currentPage,
    4
  );

  const appointments = dashboard?.upcomingAppointments.appointments.map(
    (appt,indx) => [
      indx+1, // Added ID to match header
      appt.clinician?.fullName || "Unassigned", 
      new Date(appt.scheduledAt).toLocaleDateString(), 
    ]
  ) || [];

  const medicalRecords = {
    reports: [
      [1, "Physical Examination Report", "Dec 15, 2024"],
      [2, "Annual Health Checkup", "Nov 28, 2024"],
    ],
    prescriptions: [
      [1, "Recovery Supplements", "Dec 10, 2024"],
    ],
    imaging: [
      [1, "Knee MRI Scan", "Nov 20, 2024"],
    ],
    "Lab tests": [
      [1, "Blood Test Results", "Dec 5, 2024"],
    ]
  };

  return (
    <div className="athlete-viewer-container">
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
              age: "40 years",
              height: athleteData.height + " cm",
              weight: athleteData.weight + " kg",
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
                <Button variant="primary" height="35px">
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

              <div className="appointments-list">
                {appointments.length > 0 ? (
                  appointments.map((appt, idx) => (
                    <div key={idx} className="appointment-item">
                      <div className="appointment-index">{appt[0]}</div>
                      <div className="appointment-details">
                        <div className="appointment-clinician">{appt[1]}</div>
                        <div className="appointment-date">{appt[2]}</div>
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
                    className={`medical-records-tab ${
                      activeTab === tab ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab as typeof activeTab)}
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
                      <div className="record-details">
                        <div className="record-name">{record[1]}</div>
                        <div className="record-date">{record[2]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AdjustableCard>
        </div>
      </div>
    </div>
  );
}

export default AthleteView;
