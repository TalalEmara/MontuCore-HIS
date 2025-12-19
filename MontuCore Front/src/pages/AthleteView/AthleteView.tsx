import { use, useState } from "react";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import TopBar from "../../components/level-1/TopBar/TopBar";
import Button from "../../components/level-0/Button/Bottom";
import ProfileCard from "../../components/level-1/userProfileCard/userProfileCard";
import bookAppointment from "../../assets/images/bookAppointment.webp";
import athleteProfile from "../../assets/images/Cristiano Ronaldo.webp";
import Pagination from "../../components/level-0/Pagination/Pagination";
import "./AthleteView.css";
import { useAthleteDashboard } from "../../hooks/useAthleteDashboard";
import List from "../../components/level-0/List/List";
import BookingPanel from "../../components/level-1/BookingPanel/BookingPanel";

function AthleteView() {
  const [activeTab, setActiveTab] = useState<"reports" | "prescriptions" | "imaging" | "Lab tests">("reports");
  const [currentPage, setPage] = useState(1);
  const totalPages = 5;
  const [isBooking, setIsBooking] = useState<boolean>(false)
  const baseAthleteData = {
    fullName: "Cristiano Ronaldo",
    position: "Forward",
    id: 5,
    jerseyNumber: 7,
  };

  // Fetch Data
  const { dashboard, isLoading, refetch } = useAthleteDashboard(
    baseAthleteData.id,
    currentPage,
    4
  );

  //  Merge Static Data with Dynamic Vitals
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
      : (dashboard?.latestVitals?.status == "RECOVERED" ? "Fit" : dashboard?.latestVitals?.status == "ACTIVE"?  "Injured" : "Unknown"),
  };
  const appointments = dashboard?.upcomingAppointments.appointments.map(
    (appt,indx) => [
      indx+1, // Added ID to match header
      appt.clinician?.fullName || "Unassigned", 
      new Date(appt.scheduledAt).toLocaleDateString(), 
    ]
  ) || []; 

  const cases = dashboard?.report.cases.map((report , indx)=>[
    indx+1,
    report.diagnosisName,
    new Date(report.injuryDate).toLocaleDateString(),
  ])

  const prescriptions = dashboard?.prescriptions.treatments.map((treatment, indx)=>[
    indx+1,
    treatment.description,
    new Date(treatment.date).toLocaleDateString(),
  ])
  const images = dashboard?.imaging.exams.map((exam, indx)=>[
    indx+1,
    `${exam.bodyPart}-${exam.modality}`,
    new Date(exam.performedAt|| "").toLocaleDateString(),
    exam.status
  ])

  const labTests = dashboard?.tests.labTests.map((test,indx)=>[
    indx+1,
    `${test.testName}-${test.category}`,
    new Date(test.sampleDate).toLocaleDateString(),
    test.status
  ])

  const medicalRecords = {
    reports: cases,
    prescriptions:prescriptions,
    imaging: images,
    "Lab tests": labTests
  };

  return (
    <div className="athlete-viewer-container">
      <BookingPanel isOpen={isBooking} onClose={function (): void {
        setIsBooking(false);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        refetch;
      } } athleteId={athleteData.id}/>

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
                <Button onClick={()=>setIsBooking(true)} variant="primary" height="35px">
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
                    className={`medical-records-tab ${activeTab === tab ? "active" : ""}`}
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

              <div className="medical-records-footer">
               <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={(page) => setPage(page)} 
                />
              </div>
            </div>
          </AdjustableCard>
        </div>
      </div>
    </div>
  );
}

export default AthleteView;
