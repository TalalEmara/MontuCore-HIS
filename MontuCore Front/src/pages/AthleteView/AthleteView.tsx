import { use, useEffect, useState } from "react";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import TopBar from "../../components/level-1/TopBar/TopBar";
import Button from "../../components/level-0/Button/Bottom";
import ProfileCard from "../../components/level-1/userProfileCard/userProfileCard";
import bookAppointment from '../../assets/images/bookAppointment.webp';
import athleteProfile from '../../assets/images/Cristiano Ronaldo.webp';

import "./AthleteView.css";
import BookingPanel from "../../components/level-1/BookingPanel/BookingPanel";
import { useGetUser } from "../../hooks/useAuth";
import { useAthleteAppointments } from "../../hooks/useAppointments";
import List from "../../components/level-0/List/List";
import { useCases } from "../../hooks/useCases";
import { useNavigate } from "@tanstack/react-router";

function AthleteView() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("reports");
  const [isBookingOpen, setIsBookingOpen] = useState(false);


  const { mutate: login, isPending } = useGetUser();
  const [userInfo, setUserInfo] = useState(null);
  const { data: cases, isLoading: loadingCases } = useCases( );
  const casesData = cases?.map((c) => [
    <span style={{fontWeight:600}}>{c.diagnosisName}</span>,
    // You can use your StatusBadge component here if you want colorful badges
    c.status, 
    new Date(c.injuryDate).toLocaleDateString()
  ]) || [];
   const {data:reports} = useAthleteAppointments(userInfo?.id)
   
  const reportsData = reports?.map((appt,indx) => [
    indx+1,
    appt.clinician.fullName,                         // Col 2: Clinician Name
    new Date(appt.scheduledAt).toLocaleDateString(), // Col 1: Date
              
  ]) || [];
  useEffect(() => {
    login(
      { email: "john@athlete.com", password: "Test123!" },
      {
        onSuccess: (user) => {
          console.log("Welcome " + user.fullName);

          setUserInfo({
            id: user.id,
            role: user.role,
            fullName: user.fullName
            
          });
        },
        onError: (err) => {
          console.error("Login failed:", err);
        },
      }
    );
  }, []);
  const handleAppointmentClick = (index: number) => {
    // Get the specific appointment object from the raw data
    const appointment = reports?.[index];
    
    if (!appointment) return;

    // Find the case that was created from this appointment
    const linkedCase = cases?.find((c) => c.appointmentId === appointment.id);

    if (linkedCase) {
      // If a case exists, navigate to it
      navigate({
        to: "/case/$caseId",
        params: { caseId: linkedCase.id.toString() }
      });
    } else {
      if(index == 0 ){
        navigate({
        to: "/case/67",
        params: { caseId:67 }
      })
      }
      console.log("No case found .");
     
    }
  };

  return (
    <div className="athlete-viewer-container">
      <div className="athlete-main-content">
        <TopBar
          Name={userInfo?.fullName}
          Role="Forward"
          jerseyNumber={userInfo?.id}
        />

        <div className="athlete-dashboard-grid">
          <ProfileCard 
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
            height="190px"
            minHeight="190px"
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
                  Book Your Next <br /> Appointment
                </div>
                <div className="booking-description">
                  Schedule training sessions, medical checkups, or consultations
                </div>
                <Button variant="primary" height="35px" onClick={() => setIsBookingOpen(true)}
                 >
                  SCHEDULE NOW ➜
                </Button>
              </div>
            </div>
          </AdjustableCard>

          <AdjustableCard className="medical-records-card" height="100%" minHeight="190px">
            <div className="medical-records-container">
              <div className="medical-records-header">
                <h2 className="medical-records-title">Medical Records</h2>
              </div>
              
              <div className="medical-records-tabs">
                {["cases", "prescriptions", "imaging"].map((tab) => (
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
              <List
                      header={["Diagnosis", "Status", "Date"]}
                      data={casesData}
                      gridTemplateColumns="2fr  1fr 1fr" 
                    />
            </div>
          </AdjustableCard>

          <AdjustableCard className="next-appointments-card" height="50vh" minHeight="190px">
            <div className="next-container">
              <div className="next-header">
                <h2 className="next-title">Next Appointments</h2>
              </div>
               <List
            header={["","clinician", "Date" ]}
            data={reportsData}
            onClick={handleAppointmentClick}
            />
            </div>
          </AdjustableCard>

        </div>
      </div>
      <BookingPanel 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        athleteId={userInfo?.id}/>
    </div>
  );
}

export default AthleteView;