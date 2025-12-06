import { useState } from "react"; 
import Sidebar from "../../components/level-1/Sidebar/Sidebar";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import AthleteTopBar from "../../components/level-1/AthleteTopBar/AthleteTopBar";
import Button from "../../components/level-0/Button/Bottom";
import "./AthleteView.css";
import bookAppointment from '../../assets/images/bookAppointment.jpeg';

function AthleteView() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="athlete-viewer-container">
      <Sidebar onToggle={(open) => setSidebarOpen(open)} />

      <div className="athlete-main-content">
        <AthleteTopBar
          athleteName="Maya Mohamed"
          athleteRole="Forward"
          jerseyNumber="10"
          athleteProfile="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80&auto=format&fit=crop"
        />

        <div className="athlete-dashboard-grid">
          <AdjustableCard 
            className="booking-card-wrapper"
            height="200px"
            minHeight="200px"
          >
            <div
              className="book-appointment"
              style={{
                background: `linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.45)), url(${bookAppointment})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="book-content">
                <div className="book-title">
                  Book Your Next<br />Appointment
                </div>
                <div className="book-sub">
                  Schedule training sessions, medical checkups, or consultations
                </div>
                <Button variant="primary" height="40px">
                  SCHEDULE NOW ➜
                </Button>
              </div>
            </div>
          </AdjustableCard>

          <AdjustableCard 
            className="appointments-card-wrapper"
            height="200px"
            minHeight="200px"
          >
            <div className="appointments-container">
              <div className="appointments-header">
                <h2 className="appointments-title">Upcoming Appointments</h2>
              </div>
            </div>
          </AdjustableCard>
           <AdjustableCard 
            className="appointments-card-wrapper"
            height="166px"
            minHeight="100px"
            maxWidth="100px"
          >
            <div className="appointments-container" >
              <div className="appointments-header">
                <h2 className="appointments-title">Upcoming Appointments</h2>
              </div>
            </div>
          </AdjustableCard>
        </div>
      </div>
    </div>
  );
}

export default AthleteView;