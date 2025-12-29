import React, { useState, useEffect } from "react";
import styles from "./PatientPortalView.module.css";
import ProfileCard from "../../components/level-1/userProfileCard/userProfileCard";
import InfoCard from "../../components/level-0/InfoCard/InfoCard";
import List from "../../components/level-0/List/List";
import Checkbox from "../../components/level-0/CheckBox/CheckBox";
import userProfileImage from "../../assets/images/Cristiano Ronaldo.webp";
import BasicOverlay from "../../components/level-0/Overlay/BasicOverlay";
import TextInput from "../../components/level-0/TextInput/TextInput";
import { useGenerateShareLink, useExternalConsultation } from "../../hooks/useConsultation";
import PasscodeOverlay from "../../components/level-2/PasscodeOverlay/PasscodeOverlay";
import { useParams, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";

type Severity = "MILD" | "MODERATE" | "SEVERE" | "CRITICAL";
type RecordTab = "cases" | "exams" | "labs" | "prescriptions"; // Renamed imaging to exams
type ApptStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
type CaseStatus = "ACTIVE" | "RECOVERED";

interface MedicalCase { id: number; name: string; severity: Severity; date: string; status: CaseStatus; }
interface Appointment { id: number; clinician: string; date: string; status: ApptStatus; }
interface ExamRecord { id: number; modality: string; bodyPart: string; status: string; scheduledAt: string; }
interface LabRecord { id: number; testName: string; category: string; status: string; date: string; }
interface Prescription { id: number; name: string; date: string; clinician: string; }

function PatientPortalView() {
  const [activeTab, setActiveTab] = useState<RecordTab>("cases");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const params = useParams({ strict: false });
  const Token = params.token || 0;
  const athleteId = params.athleteId || 0;
  const [shareNotes, setShareNotes] = useState("Please review the selected medical records and provide your expert opinion.");
  const [expiryHours, setExpiryHours] = useState("1");
  const search: any = useSearch({ strict: false });
  const isConsulting = search.view === "consulting";
  const isExternal = search.view === "external";
  const { user, token } = useAuth();
  
  // For internal view, use the authenticated user's ID; for external/consulting, use the param
  const effectiveAthleteId = isExternal || isConsulting ? athleteId : (user?.id || 0);
  
  const [accessCode, setAccessCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(!isExternal);

  const { mutate, data: shareResponse, isPending, isSuccess, reset } = useGenerateShareLink();

  const { 
    data: externalResponse, 
    isLoading: isExtLoading, 
    isError: isExtError,
    isSuccess: isExtFetchSuccess 
  } = useExternalConsultation(
    Token, 
    accessCode, 
    isAuthorized && isExternal
  );

  // Fetch dashboard data for the portal
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['athlete-portal', effectiveAthleteId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/api/athlete/dashboard/${effectiveAthleteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    enabled: !!effectiveAthleteId && !!token && !isExternal, // Only fetch for internal/consulting views
  });

  // Fetch physio programs for the athlete
  const { data: physioData, isLoading: isPhysioLoading } = useQuery({
    queryKey: ['physio-programs', effectiveAthleteId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/api/physio-programs/athlete/${effectiveAthleteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch physio programs');
      return response.json();
    },
    enabled: !!effectiveAthleteId && !!token && !isExternal, // Only fetch for internal/consulting views
  });
  const handlePasscodeSuccess = (enteredCode: string) => {
    setAccessCode(enteredCode);
    setIsAuthorized(true);
  };

  useEffect(() => {
    if (isExtError) {
      setIsAuthorized(false);
    }
  }, [isExtError]);

// Map the dashboard result to the local interfaces expected by the List components.
// Use externalResponse for external views, dashboardData for internal/consulting views

const dataSource = isExternal ? externalResponse?.data : dashboardData?.data;

const appointmentsData: Appointment[] = dataSource?.upcomingAppointments?.appointments?.map(appt => ({
  id: appt.id,
  clinician: appt.clinician?.fullName || "Unassigned",
  date: new Date(appt.scheduledAt).toLocaleDateString(),
  status: appt.status as ApptStatus
})) || [];

const cases: MedicalCase[] = dataSource?.report?.cases?.map(c => ({
  id: c.id,
  name: c.diagnosisName,
  severity: c.severity as Severity,
  date: new Date(c.injuryDate).toLocaleDateString(),
  status: c.status as CaseStatus
})) || [];

const examsData: ExamRecord[] = dataSource?.imaging?.exams?.map(e => ({
  id: e.id,
  modality: e.modality,
  bodyPart: e.bodyPart,
  status: e.status,
  scheduledAt: e.scheduledAt
})) || [];

const labsData: LabRecord[] = dataSource?.tests?.labTests?.map(l => ({
  id: l.id,
  testName: l.testName,
  category: l.category,
  status: l.status,
  date: new Date(l.sampleDate).toLocaleDateString()
})) || [];

const prescriptions: Prescription[] = dataSource?.prescriptions?.treatments?.map(t => ({
    name: t.description, // using description as name
    date: new Date(t.date).toLocaleDateString(),
    clinician: t.providerName
  })) || [];

  // Calculate physio progress stats from physio programs
  const physioStats = React.useMemo(() => {
    if (!physioData?.data?.programs) {
      return { totalSessions: 0, completedSessions: 0, weeklySessions: 0 };
    }

    const programs = physioData.data.programs;
    const totalSessions = programs.reduce((sum, program) => sum + (program.numberOfSessions || 0), 0);
    const completedSessions = programs.reduce((sum, program) => sum + (program.sessionsCompleted || 0), 0);
    const weeklySessions = programs.reduce((sum, program) => sum + (program.weeklyRepetition || 0), 0);

    return { totalSessions, completedSessions, weeklySessions };
  }, [physioData]);

  const filterData = <T extends { id: number }>(data: T[], category: string) => {
    if (!isExternal) return data;
    return data.filter(item => selectedIds.includes(`${category}-${item.id}`));
  };

  const currentAppointments = filterData(appointmentsData, "appt");
  const currentCases = filterData(cases, "cases");
  const currentExams = filterData(examsData, "exams");
  const currentLabs = filterData(labsData, "labs");
  const currentPrescriptions = filterData(prescriptions, "prescriptions");

  const toggleSelect = (cat: string, id: number) => {
    const key = `${cat}-${id}`;
    setSelectedIds(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleAll = (cat: string, data: { id: number }[]) => {
    const keys = data.map(d => `${cat}-${d.id}`);
    const allIn = keys.every(k => selectedIds.includes(k));
    setSelectedIds(prev => allIn ? prev.filter(k => !keys.includes(k)) : Array.from(new Set([...prev, ...keys])));
  };

  const handleConfirm = () => {
    const caseIds = selectedIds.filter(id => id.startsWith("cases-")).map(id => parseInt(id.split("-")[1]));
    const examIds = selectedIds.filter(id => id.startsWith("exams-")).map(id => parseInt(id.split("-")[1]));
    const labIds = selectedIds.filter(id => id.startsWith("labs-")).map(id => parseInt(id.split("-")[1]));

    mutate({
      athleteId: effectiveAthleteId,
      permissions: { caseIds, examIds, labIds, notes: shareNotes },
      expiryHours: parseInt(expiryHours) || 1
    });
  };

  const renderStatusTag = (value: string) => (
    <div className={`${styles.appointmentStatus} ${styles[value.toLowerCase()]}`}>{value}</div>
  );

  const getListConfig = () => {
    if (isExternal && isExtFetchSuccess && externalResponse) {
      const ext = externalResponse.data.data;
      if (activeTab === "cases") return {
        header: ["#", "Diagnosis", "Severity", "Date", "Status"],
        cols: ".7fr 2fr 1.2fr 1.5fr 1fr",
        data: ext.cases.map((c: any) => [c.id, c.diagnosisName, renderStatusTag(c.severity), new Date(c.injuryDate).toLocaleDateString(), renderStatusTag(c.status)])
      };
      if (activeTab === "exams") return {
        header: ["#", "Modality", "Body Part", "Date", "Status"],
        cols: ".7fr 1fr 1fr 1.5fr 1fr",
        data: ext.exams.map((e: any) => [e.id, e.modality, e.bodyPart, new Date(e.performedAt || e.scheduledAt).toLocaleDateString(), renderStatusTag(e.status)])
      };
      if (activeTab === "labs") return {
        header: ["#", "Test", "Category", "Date", "Status"],
        cols: ".7fr 2fr 1.5fr 1.5fr 1fr",
        data: ext.labs.map((l: any) => [l.id, l.testName, l.category, new Date(l.sampleDate).toLocaleDateString(), renderStatusTag(l.status)])
      };
    }

    const showCheckboxes = isConsulting && !isExternal;
    const cat = activeTab;
    const baseData = activeTab === "cases" ? currentCases : activeTab === "exams" ? currentExams : activeTab === "labs" ? currentLabs : currentPrescriptions;
    const allChecked = baseData.every(d => selectedIds.includes(`${cat}-${d.id}`));
    const checkboxHeader = showCheckboxes ? [<Checkbox label="" checked={allChecked} onChange={() => toggleAll(cat, baseData as any)} />] : [];
    
    switch (activeTab) {
      case "cases":
        return {
          header: [...checkboxHeader, `${currentCases.length} cases`, "Diagnosis", "Severity", "Date", "Status"],
          cols: (showCheckboxes ? "0.4fr " : "") + ".7fr 2fr 1.2fr 1.5fr 1fr",
          data: currentCases.map(c => [
            ...(showCheckboxes ? [<Checkbox label="" checked={selectedIds.includes(`cases-${c.id}`)} onChange={() => toggleSelect("cases", c.id)} />] : []),
            c.id, c.name, renderStatusTag(c.severity), c.date, renderStatusTag(c.status)
          ])
        };
      case "prescriptions":
        return {
          header: [...checkboxHeader, "#", "Medication", "Date", "Clinician"],
          cols: (showCheckboxes ? "0.4fr " : "") + ".7fr 3fr 3fr 1.5fr",
          data: currentPrescriptions.map(p => [
            ...(showCheckboxes ? [<Checkbox label="" checked={selectedIds.includes(`prescriptions-${p.id}`)} onChange={() => toggleSelect("prescriptions", p.id)} />] : []),
            p.id, p.name, p.date, p.clinician
          ])
        };
      case "exams": // MODALITY & BODY PART
        return {
          header: [...checkboxHeader, "#", "Modality", "Body Part", "Scheduled At", "Status"],
          cols: (showCheckboxes ? "0.4fr " : "") + ".7fr 1fr 1fr 1.5fr 1fr",
          data: currentExams.map(e => [
            ...(showCheckboxes ? [<Checkbox label="" checked={selectedIds.includes(`exams-${e.id}`)} onChange={() => toggleSelect("exams", e.id)} />] : []),
            e.id, e.modality, e.bodyPart, new Date(e.scheduledAt).toLocaleDateString(), renderStatusTag(e.status)
          ])
        };
      case "labs": // TEST NAME & CATEGORY
        return {
          header: [...checkboxHeader, "#", "Test Name", "Category", "Date", "Status"],
          cols: (showCheckboxes ? "0.4fr " : "") + ".7fr 2fr 1.2fr 1.5fr 1fr",
          data: currentLabs.map(l => [
            ...(showCheckboxes ? [<Checkbox label="" checked={selectedIds.includes(`labs-${l.id}`)} onChange={() => toggleSelect("labs", l.id)} />] : []),
            l.id, l.testName, l.category, l.date, renderStatusTag(l.status)
          ])
        };
      default: return { header: [], cols: "", data: [] };
    }
  };

  const CaseStats = { age: "40 years", height: "187 cm", weight: "84 kg", status: "ACTIVE", role: "Forward", jersey: "#7" };

  if (isExternal && !isExtFetchSuccess) {
    return (
      <PasscodeOverlay 
        isOpen={true} 
        onSuccess={handlePasscodeSuccess} 
        error={isExtError ? "Access Denied: Invalid Code" : isExtLoading ? "Verifying..." : ""}
      />
    );
  }

  const { header, cols, data } = getListConfig();

  return (
    <div className={styles.patientPortalContainer}>
      <BasicOverlay isOpen={isSuccess} onClose={() => reset()} title="Consultation Link Generated">
        <div className={styles.shareResultContent}>
            <div className={styles.resultItem}><label>Full Link:</label><div className={styles.linkBox}>{shareResponse?.data.fullLink}</div></div>
            <div className={styles.resultItem}><label>Access Code:</label><div className={styles.codeBox}>{shareResponse?.data.accessCode}</div></div>
        </div>
      </BasicOverlay>

      <div className={styles.patientPortalMainContent}>
        <div className={styles.patientPortalDashboardGrid}>
          <div className={styles.leftColumn}>
            <ProfileCard 
              className={styles.patientPortalProfileCard} 
              profileImage={userProfileImage} 
              title={isExternal ? externalResponse?.data.meta.patientName : "Athlete Information"} 
              stats={isExternal ? { status: "EXTERNAL VIEW" } : CaseStats} 
            />
            
            {isConsulting && !isExternal && (
              <div className={styles.shareOptionsArea}>
                <TextInput label="Consultation Notes" value={shareNotes} onChange={setShareNotes} height={80} placeholder="Enter notes..." />
                <TextInput label="Expiry (Hours)" type="number" value={expiryHours} onChange={setExpiryHours} min="1" />
                {selectedIds.length > 0 && (
                  <button className={styles.leftConfirmBtn} onClick={handleConfirm} disabled={isPending}>
                    {isPending ? "Generating..." : `Confirm Selection (${selectedIds.length})`}
                  </button>
                )}
              </div>
            )}

            {isExternal && externalResponse && (
              <div className={styles.externalMetaInfo} style={{padding: '1rem', background: 'var(--card-bg)', borderRadius: '8px', marginTop: '1rem', border: '1px solid rgba(255,255,255,0.1)'}}>
                <h4 style={{color: 'var(--accent)', marginBottom: '0.5rem'}}>Shared by {externalResponse.data.meta.sharedBy}</h4>
                <p style={{fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.4'}}><strong>Notes:</strong> {externalResponse.data.meta.notes}</p>
              </div>
            )}
          </div>

          <div className={styles.appointmentsCard}>
            <div className={styles.appointmentsContainer}>
              <div className={styles.appointmentsHeader}><h2 className={styles.appointmentsTitle}>Appointments</h2></div>
              <div className={styles.appointmentsList}>
                <List
                  header={["#", "Clinician", "Date", "Status"]}
                  data={currentAppointments.map(app => [app.id, app.clinician, app.date, renderStatusTag(app.status)])}
                  gridTemplateColumns=".6fr 2fr 1.2fr 1.2fr" 
                />
              </div>
            </div>
          </div>

          <div className={styles.physioCard}>
            <div className={styles.physioContainer}>
              <div className={styles.physioHeader}><h2 className={styles.physioTitle}>Physio Progress</h2></div>
              <div className={styles.physioContent}>
                <div className={styles.physioStats}><InfoCard label="Sessions" value={physioStats.totalSessions} /><InfoCard label="Done" value={physioStats.completedSessions} /><InfoCard label="Weekly" value={physioStats.weeklySessions} /></div>
              </div>
            </div>
          </div>

          <div className={styles.medicalRecordsCard}>
            <div className={styles.medicalRecordsContainer}>
              <div className={styles.medicalRecordsHeader}><h2 className={styles.medicalRecordsTitle}>{isExternal ? "Shared Records" : "Medical Records"}</h2></div>
              <div className={styles.recordsTabs}>
                {(["cases", "exams", "labs", "prescriptions"] as const).map((tab) => (
                  <div key={tab} className={`${styles.recordsTab} ${activeTab === tab ? styles.activeTab : ""}`} onClick={() => setActiveTab(tab)}>{tab}</div>
                ))}
              </div>
              <div className={styles.recordsList}><List header={header as any} data={data as any} gridTemplateColumns={cols} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientPortalView;