import React, { useEffect, useState } from "react";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import ProfileCard from "../../components/level-1/userProfileCard/userProfileCard";
import TopBar from "../../components/level-1/TopBar/TopBar";
import styles from "./PhysicianView.module.css";
import physicianProfile from "../../assets/images/physician.webp";
import { useGetUser } from "../../hooks/useAuth";
import { useClinicianAppointments } from "../../hooks/useAppointments";
import { useCases } from "../../hooks/useCases";

const PhysicianView: React.FC = () => {
  const { mutate: login, isPending } = useGetUser();

  const [urgentCases] = useState([
    {
      id: "1",
      athleteName: "Cristiano Ronaldo",
      injury: "Knee Strain",
      priority: "urgent",
    },
    {
      id: "2",
      athleteName: "Mohamed Salah",
      injury: "Hamstring Injury",
      priority: "high",
    },
    {
      id: "3",
      athleteName: "Neymar",
      injury: "Ankle Sprain",
      priority: "medium",
    },
    {
      id: "4",
      athleteName: "Leo",
      injury: "Muscle Fatigue",
      priority: "medium",
    },
    { id: "5", athleteName: "Messi", injury: "Back Pain", priority: "high" },
    {
      id: "6",
      athleteName: "Famous",
      injury: "Shoulder Strain",
      priority: "low",
    },
  ]);


  const [physioNotes] = useState([
    {
      athleteName: "Cristiano Ronaldo",
      note: "Mild fatigue, monitor next session",
    },
    { athleteName: "Mohamed Salah", note: "Slight hamstring tightness" },
    { athleteName: "Neymar", note: "Knee warm-up needed before training" },
    { athleteName: "Leo", note: "Reported minor ankle discomfort" },
  ]);

  // const [athleteComplaints] = useState([
  //   {
  //     athleteName: "Cristiano Ronaldo",
  //     complaint: "Knee pain before training",
  //     caseLink: "#",
  //   },
  //   {
  //     athleteName: "Mohamed Salah",
  //     complaint: "Muscle tightness after match",
  //     caseLink: "#",
  //   },
  //   { athleteName: "Neymar", complaint: "Ankle discomfort", caseLink: "#" },
  //   { athleteName: "Leo", complaint: "Back soreness", caseLink: "#" },
  // ]);

  // const profileStats = { age: "30 years", role: "Physician" };
  const [userInfo, setUserInfo] = useState(null);
  const profileImage = physicianProfile;
  useEffect(() => {
    login(
      { email: "physio@sportshis.com", password: "Test123!" },
      {
        onSuccess: (user) => {
          console.log("Welcome " + user.fullName);

          setUserInfo({
            id: user.id,
            role: user.role,
            fullName: user.fullName,
          });
        },
        onError: (err) => {
          console.error("Login failed:", err);
        },
      }
    );
  }, []);

  const { data: appointments, isLoading } = useClinicianAppointments(
    userInfo?.id
  );
  const todaySchedule = appointments
    ? appointments
        // Optional: Filter for ONLY today's appointments
        .filter(appt => new Date(appt.scheduledAt).toDateString() === new Date().toDateString())
        .map((appt) => {
          // Map API status to CSS class names
          let uiStatus = "upcoming";
          if (appt.status === "COMPLETED") uiStatus = "completed";
          else if (appt.status === "CANCELLED") uiStatus = "cancelled";
          else if (appt.status === "SCHEDULED") uiStatus = "upcoming";

          return {
            id: appt.id,
            athleteName: appt.athlete.fullName,
            type: "Checkup",
            status: uiStatus,
          };
        })
    : [];
    
    const { data: cases, isLoading: loadingCases } = useCases( );
  const athleteComplaints = cases
    ? cases.map((medicalCase) => ({
        id: medicalCase.id, // Good for React keys
        athleteName: medicalCase.athlete.fullName,
        complaint: medicalCase.diagnosisName, // Mapping Diagnosis -> Complaint
        caseLink: `/case/${medicalCase.id}`, // Dynamic Link
      }))
    : [];
  const statsData = userInfo
    ? { ID: userInfo.id, role: userInfo.role }
    : { ID: "37", role: "Physician" };
  const displayName = userInfo?.fullName || "Loading...";
  const displayRole = userInfo?.role || "Sports Physician";
  return (
    <div className={styles.physicianViewerContainer}>
      <div className={styles.physicianMainContent}>
        <TopBar Name={displayName} Role={displayRole} />

        <div className={styles.physicianDashboardGrid}>
          <ProfileCard
            profileImage={profileImage}
            stats={statsData}
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
                <h2 className={styles.appointmentsTitle}>Urgent Cases</h2>
              </div>
              <div className={styles.casesList}>
                {urgentCases.map(({ id, athleteName, injury, priority }) => (
                  <div
                    key={id}
                    className={`${styles.caseRow} ${styles[priority]}`}
                  >
                    <div className={styles.caseName}>{athleteName}</div>
                    <div className={styles.caseInjury}>{injury}</div>
                  </div>
                ))}
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
                {todaySchedule.map(({ athleteName, type, status }, idx) => (
                  <div key={idx} className={styles.scheduleRow}>
                    <div className={styles.scheduleInfo}>
                      <span className={styles.athleteName}>{athleteName}</span>{" "}
                      - <span>{type}</span>
                    </div>
                    <div className={`${styles.status} ${styles[status]}`}>
                      {status}
                    </div>
                  </div>
                ))}
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
                {athleteComplaints.map(
                  ({ athleteName, complaint, caseLink }, idx) => (
                    <div key={idx} className={styles.athleteHandlingRow}>
                      <div className={styles.athleteName}>{athleteName}</div>
                      <div className={styles.athleteComplaint}>{complaint}</div>
                      <a href={caseLink} className={styles.caseButton}>
                        View Case
                      </a>
                    </div>
                  )
                )}
              </div>
            </div>
          </AdjustableCard>
        </div>
      </div>
    </div>
  );
};

export default PhysicianView;
