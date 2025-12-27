import { useState, useEffect } from "react";
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
  
  const [shareNotes, setShareNotes] = useState("Please review the selected medical records and provide your expert opinion.");
  const [expiryHours, setExpiryHours] = useState("1");

  const isConsulting = true; 
  const isExternal = false; 
  const Token = "e1d41086-a186-4494-901e-464cae06a276";
  
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

  const handlePasscodeSuccess = (enteredCode: string) => {
    setAccessCode(enteredCode);
    setIsAuthorized(true);
  };

  useEffect(() => {
    if (isExtError) {
      setIsAuthorized(false);
    }
  }, [isExtError]);

  const appointmentsData: Appointment[] = [
    { id: 1, clinician: "Dr. Smith", date: "2025-01-05", status: "COMPLETED" },
    { id: 2, clinician: "Dr. Jones", date: "2025-01-18", status: "CANCELLED" },
    { id: 3, clinician: "Dr. Taylor", date: "2025-01-25", status: "SCHEDULED" },
  ];

  const cases: MedicalCase[] = [
    { id: 1, name: "Complete ACL Tear", severity: "SEVERE", date: "12/07/2025", status: "ACTIVE" },
    { id: 10, name: "Rotator Cuff Strain", severity: "MODERATE", date: "12/17/2025", status: "ACTIVE" },
  ];

  // Renamed from imaging to exams
  const examsData: ExamRecord[] = [
    { id: 13, modality: "MRI", bodyPart: "Knee", status: "COMPLETED", scheduledAt: "2025-12-09T13:50:06.658Z" },
    { id: 10, modality: "X-RAY", bodyPart: "Knee", status: "COMPLETED", scheduledAt: "2025-12-08T13:50:06.658Z" },
  ];

  const labsData: LabRecord[] = [
    { id: 1, testName: "Complete Blood Count", category: "Hematology", status: "COMPLETED", date: "2025-12-11" },
    { id: 7, testName: "Coagulation Profile", category: "Hematology", status: "COMPLETED", date: "2025-12-11" },
  ];

  const prescriptions: Prescription[] = [
    { id: 1, name: "Ibuprofen 400mg", date: "2024-10-15", clinician: "Dr. Smith" },
    { id: 5, name: "Diclofenac Gel", date: "2024-06-25", clinician: "Dr. Taylor" },
  ];

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
      athleteId: 5,
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
                <div className={styles.physioStats}><InfoCard label="Sessions" value={20} /><InfoCard label="Done" value={8} /><InfoCard label="Weekly" value={3} /></div>
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