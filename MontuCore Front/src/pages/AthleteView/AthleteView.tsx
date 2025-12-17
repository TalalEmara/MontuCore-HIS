import { useState } from "react";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import TopBar from "../../components/level-1/TopBar/TopBar";
import Button from "../../components/level-0/Button/Bottom";
import ProfileCard from "../../components/level-1/userProfileCard/userProfileCard";
import bookAppointment from '../../assets/images/bookAppointment.webp';
import athleteProfile from '../../assets/images/Cristiano Ronaldo.webp';

import "./AthleteView.css";

function AthleteView() {
  const [activeTab, setActiveTab] = useState("reports");

  return (
    <div className="athlete-viewer-container">
      <div className="athlete-main-content">
        <TopBar
          Name="Ronaldo"
          Role="Forward"
          jerseyNumber="10"
        />

        <div className="athlete-dashboard-grid">
          <ProfileCard 
            className="athlete-profile-card"
            profileImage={athleteProfile}
            stats={{
              age: "40 years",
              height: "185 cm",
              weight: "72 kg",
              status: "Fit",
              role: "Forward",
              jersey: "#10",
            }}
          />

          <AdjustableCard
            className="booking-card-wrapper"
            height="100%"
          >
            <div
              className="book-appointment"
              style={{
                background: `linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.45)), url(${bookAppointment})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="book-content">
                <div className="book-title">
                  Book Your Next Appointment
                </div>
                <div className="booking-description">
                  Schedule training sessions, medical checkups, or consultations
                </div>
                <Button variant="primary" height="35px" >
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