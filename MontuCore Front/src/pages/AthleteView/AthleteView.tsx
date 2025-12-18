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
  const [activeTab, setActiveTab] = useState("reports");
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
              // still no AGE
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

              <List header={["", "Clicincian", "Date"]} data={appointments} gridTemplateColumns=".2fr 1fr 1fr" />
            </div>
          </AdjustableCard>

          <AdjustableCard className="medical-records-card" height="100%">
            <div className="medical-records-container">
              <div className="medical-records-header">
                <h2 className="medical-records-title">Medical Records</h2>
              </div>

              <div className="medical-records-tabs">
                {["reports", "prescriptions", "imaging"].map((tab) => (
                  <div
                    key={tab}
                    className={`medical-records-tab ${
                      activeTab === tab ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </div>
                ))}
              </div>
            </div>
          </AdjustableCard>
        </div>
      </div>
    </div>
  );
}

export default AthleteView;
