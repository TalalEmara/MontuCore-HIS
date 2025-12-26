import { useState } from "react";
import styles from "./PatientPortalView.module.css";
import ProfileCard from "../../components/level-1/userProfileCard/userProfileCard";
import InfoCard from "../../components/level-0/InfoCard/InfoCard";
import List from "../../components/level-0/List/List";
import Checkbox from "../../components/level-0/CheckBox/CheckBox";
import userProfileImage from "../../assets/images/Cristiano Ronaldo.webp";

type Severity = "MILD" | "MODERATE" | "SEVERE" | "CRITICAL";
type RecordTab = "cases" | "imaging" | "labs" | "prescriptions";
type ApptStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
type CaseStatus = "ACTIVE" | "RECOVERED";
type TestStatus = "PENDING" | "COMPLETED";

interface MedicalCase { id: number; name: string; severity: Severity; date: string; status: CaseStatus; }
interface Appointment { id: number; clinician: string; date: string; status: ApptStatus; }
interface ClinicalRecord { id: number; name: string; date: string; clinician: string; status: TestStatus; }
interface Prescription { id: number; name: string; date: string; clinician: string; }

function PatientPortalView() {
  const [activeTab, setActiveTab] = useState<RecordTab>("cases");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isConsultant = true;

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
    const selectedRows = selectedIds.map(key => {
      const [cat, idStr] = key.split("-");
      const id = parseInt(idStr);
      let item: any;

      if (cat === "appt") item = appointmentsData.find(d => d.id === id);
      else if (cat === "cases") item = cases.find(d => d.id === id);
      else if (cat === "imaging") item = imaging.find(d => d.id === id);
      else if (cat === "labs") item = labs.find(d => d.id === id);
      else if (cat === "prescriptions") item = prescriptions.find(d => d.id === id);

      const categoryLabel = cat === "appt" ? "appointments" : cat;

      return {
        category: categoryLabel,
        id: item?.id,
        ...item
      };
    });

    console.log("Confirmed Selection:", selectedRows);
  };

  const renderStatusTag = (value: string) => (
    <div className={`${styles.appointmentStatus} ${styles[value.toLowerCase()]}`}>{value}</div>
  );

  const appointmentsData: Appointment[] = [
    { id: 1, clinician: "Dr. 1", date: "2025-01-05", status: "COMPLETED" },
    { id: 2, clinician: "Dr. 2", date: "2025-01-18", status: "CANCELLED" },
    { id: 3, clinician: "Dr. 3", date: "2025-01-25", status: "SCHEDULED" },
    { id: 4, clinician: "Dr. 4", date: "2025-02-01", status: "SCHEDULED" },
    { id: 5, clinician: "Dr. 5", date: "2025-02-10", status: "SCHEDULED" },
    { id: 6, clinician: "Dr. 6", date: "2025-02-15", status: "SCHEDULED" },
    { id: 7, clinician: "Dr. 7", date: "2025-02-20", status: "SCHEDULED" },
    { id: 8, clinician: "Dr. 8", date: "2025-02-25", status: "SCHEDULED" },
    { id: 9, clinician: "Dr. 9", date: "2025-03-01", status: "SCHEDULED" },
    { id: 10, clinician: "Dr. 10", date: "2025-03-05", status: "SCHEDULED" },
  ];

  const cases: MedicalCase[] = [
    { id: 1, name: "ACL Tear", severity: "CRITICAL", date: "10/15/2024", status: "ACTIVE" },
    { id: 2, name: "Hamstring Strain", severity: "SEVERE", date: "09/20/2024", status: "RECOVERED" },
    { id: 3, name: "Ankle Sprain", severity: "MODERATE", date: "08/10/2024", status: "RECOVERED" },
    { id: 4, name: "Meniscus Tear", severity: "SEVERE", date: "05/12/2024", status: "ACTIVE" },
    { id: 5, name: "Muscle Fatigue", severity: "MILD", date: "04/01/2024", status: "RECOVERED" },
    { id: 6, name: "Patellar Tendonitis", severity: "MODERATE", date: "03/15/2024", status: "RECOVERED" },
    { id: 7, name: "Groin Strain", severity: "MILD", date: "02/20/2024", status: "RECOVERED" },
    { id: 8, name: "Shin Splints", severity: "MILD", date: "01/10/2024", status: "ACTIVE" },
    { id: 9, name: "Lower Back Pain", severity: "MODERATE", date: "12/05/2023", status: "RECOVERED" },
    { id: 10, name: "Shoulder Pain", severity: "SEVERE", date: "11/12/2023", status: "RECOVERED" },
  ];

  const imaging: ClinicalRecord[] = [
    { id: 1, name: "Knee MRI", date: "2024-10-16", clinician: "Dr. 1", status: "COMPLETED" },
    { id: 2, name: "Ankle X-Ray", date: "2024-09-21", clinician: "Dr. 2", status: "PENDING" },
    { id: 3, name: "Lumbar CT", date: "2024-08-05", clinician: "Dr. 3", status: "COMPLETED" },
    { id: 4, name: "Shoulder MRI", date: "2024-07-20", clinician: "Dr. 4", status: "COMPLETED" },
    { id: 5, name: "Wrist X-Ray", date: "2024-06-15", clinician: "Dr. 5", status: "PENDING" },
    { id: 6, name: "Chest X-Ray", date: "2024-05-10", clinician: "Dr. 6", status: "COMPLETED" },
    { id: 7, name: "Hip MRI", date: "2024-04-05", clinician: "Dr. 7", status: "COMPLETED" },
    { id: 8, name: "Brain CT", date: "2024-03-01", clinician: "Dr. 8", status: "COMPLETED" },
    { id: 9, name: "Elbow X-Ray", date: "2024-02-15", clinician: "Dr. 9", status: "COMPLETED" },
    { id: 10, name: "Foot MRI", date: "2024-01-20", clinician: "Dr. 10", status: "PENDING" },
  ];

  const labs: ClinicalRecord[] = [
    { id: 1, name: "Blood Test", date: "2024-10-18", clinician: "Dr. 1", status: "COMPLETED" },
    { id: 2, name: "Urine Analysis", date: "2024-11-05", clinician: "Dr. 2", status: "COMPLETED" },
    { id: 3, name: "Vitamin D", date: "2024-11-12", clinician: "Dr. 3", status: "PENDING" },
    { id: 4, name: "Liver Profile", date: "2024-12-01", clinician: "Dr. 4", status: "COMPLETED" },
    { id: 5, name: "Kidney Profile", date: "2024-12-15", clinician: "Dr. 5", status: "COMPLETED" },
    { id: 6, name: "Iron Study", date: "2024-12-20", clinician: "Dr. 6", status: "COMPLETED" },
    { id: 7, name: "Glucose Test", date: "2024-12-25", clinician: "Dr. 7", status: "COMPLETED" },
    { id: 8, name: "Electrolytes", date: "2025-01-02", clinician: "Dr. 8", status: "COMPLETED" },
    { id: 9, name: "Hormone Panel", date: "2025-01-08", clinician: "Dr. 9", status: "COMPLETED" },
    { id: 10, name: "Lipid Profile", date: "2025-01-12", clinician: "Dr. 10", status: "COMPLETED" },
  ];

  const prescriptions: Prescription[] = [
    { id: 1, name: "Ibuprofen 400mg", date: "2024-10-15", clinician: "Dr. 1" },
    { id: 2, name: "Paracetamol", date: "2024-09-20", clinician: "Dr. 2" },
    { id: 3, name: "Amoxicillin", date: "2024-08-05", clinician: "Dr. 3" },
    { id: 4, name: "Vitamin C 1000mg", date: "2024-07-10", clinician: "Dr. 4" },
    { id: 5, name: "Diclofenac Gel", date: "2024-06-25", clinician: "Dr. 5" },
    { id: 6, name: "Omega 3", date: "2024-05-30", clinician: "Dr. 6" },
    { id: 7, name: "Calcium", date: "2024-05-15", clinician: "Dr. 7" },
    { id: 8, name: "Magnesium", date: "2024-04-20", clinician: "Dr. 8" },
    { id: 9, name: "B12 Injection", date: "2024-03-10", clinician: "Dr. 9" },
    { id: 10, name: "Aspirin", date: "2024-02-05", clinician: "Dr. 10" },
  ];

  const CaseStats = { 
    age: "40 years", 
    height: "187 cm", 
    weight: "84 kg", 
    status: "ACTIVE", 
    role: "Forward", 
    jersey: "#7" 
  };

  const getListConfig = () => {
    const baseData = activeTab === "cases" ? cases : activeTab === "imaging" ? imaging : activeTab === "labs" ? labs : prescriptions;
    const cat = activeTab;
    const allChecked = baseData.every(d => selectedIds.includes(`${cat}-${d.id}`));
    const checkboxHeader = isConsultant ? [<Checkbox label="" checked={allChecked} onChange={() => toggleAll(cat, baseData)} />] : [];
    
    switch (activeTab) {
      case "cases":
        return {
          header: [...checkboxHeader, `${cases.length} cases`, "Diagnosis", "Severity", "Date", "Status"],
          cols: (isConsultant ? "0.4fr " : "") + ".7fr 2fr 1.2fr 1.5fr 1fr",
          data: cases.map(c => [
            ...(isConsultant ? [<Checkbox label="" checked={selectedIds.includes(`cases-${c.id}`)} onChange={() => toggleSelect("cases", c.id)} />] : []),
            c.id, c.name, renderStatusTag(c.severity), c.date, renderStatusTag(c.status)
          ])
        };
      case "prescriptions":
        return {
          header: [...checkboxHeader, "#", "Medication", "Date", "Clinician"],
          cols: (isConsultant ? "0.4fr " : "") + ".7fr 3fr 3fr 1.5fr",
          data: prescriptions.map(p => [
            ...(isConsultant ? [<Checkbox label="" checked={selectedIds.includes(`prescriptions-${p.id}`)} onChange={() => toggleSelect("prescriptions", p.id)} />] : []),
            p.id, p.name, p.date, p.clinician
          ])
        };
      case "imaging":
        return {
          header: [...checkboxHeader, "#", "Record", "Date", "Clinician", "Status"],
          cols: (isConsultant ? "0.4fr " : "") + ".7fr 2fr 1.2fr 1.5fr 1fr",
          data: imaging.map(i => [
            ...(isConsultant ? [<Checkbox label="" checked={selectedIds.includes(`imaging-${i.id}`)} onChange={() => toggleSelect("imaging", i.id)} />] : []),
            i.id, i.name, i.date, i.clinician, renderStatusTag(i.status)
          ])
        };
      case "labs":
        return {
          header: [...checkboxHeader, "#", "Record", "Date", "Clinician", "Status"],
          cols: (isConsultant ? "0.4fr " : "") + ".7fr 2fr 1.2fr 1.5fr 1fr",
          data: labs.map(l => [
            ...(isConsultant ? [<Checkbox label="" checked={selectedIds.includes(`labs-${l.id}`)} onChange={() => toggleSelect("labs", l.id)} />] : []),
            l.id, l.name, l.date, l.clinician, renderStatusTag(l.status)
          ])
        };
      default: return { header: [], cols: "", data: [] };
    }
  };

  const { header, cols, data } = getListConfig();
  return (
    <div className={styles.patientPortalContainer}>
      <div className={styles.patientPortalMainContent}>
        <div className={styles.patientPortalDashboardGrid}>
          <div className={styles.leftColumn}>
            <ProfileCard className={styles.patientPortalProfileCard} profileImage={userProfileImage} title="Athlete Information" stats={CaseStats} />
            {isConsultant && selectedIds.length > 0 && (
              <button className={styles.leftConfirmBtn} onClick={handleConfirm}>Confirm Selection ({selectedIds.length})</button>
            )}
          </div>
          <div className={styles.appointmentsCard}>
            <div className={styles.appointmentsContainer}>
              <div className={styles.appointmentsHeader}>
                <h2 className={styles.appointmentsTitle}>Appointments</h2>
                {isConsultant && <Checkbox label="All" checked={appointmentsData.every(d => selectedIds.includes(`appt-${d.id}`))} onChange={() => toggleAll("appt", appointmentsData)} />}
              </div>
              <div className={styles.appointmentsList}>
                <List
                  header={[...(isConsultant ? [""] : []), "#", "Clinician", "Date", "Status"]}
                  data={appointmentsData.map(app => [
                    ...(isConsultant ? [<Checkbox label="" checked={selectedIds.includes(`appt-${app.id}`)} onChange={() => toggleSelect("appt", app.id)} />] : []),
                    app.id, <div className={styles.appointmentClinician}>{app.clinician}</div>, app.date, renderStatusTag(app.status)
                  ])}
                  gridTemplateColumns={(isConsultant ? "0.4fr " : "") + ".6fr 2fr 1.2fr 1.2fr"}
                />
              </div>
            </div>
          </div>
          <div className={styles.physioCard}>
            <div className={styles.physioContainer}>
              <div className={styles.physioHeader}><h2 className={styles.physioTitle}>Physio Progress</h2></div>
              <div className={styles.physioContent}><div className={styles.physioStats}><InfoCard label="Sessions" value={20} /><InfoCard label="Done" value={8} /><InfoCard label="Weekly" value={3} /></div></div>
            </div>
          </div>
          <div className={styles.medicalRecordsCard}>
            <div className={styles.medicalRecordsContainer}>
              <div className={styles.medicalRecordsHeader}><h2 className={styles.medicalRecordsTitle}>Medical Records</h2></div>
              <div className={styles.recordsTabs}>{(["cases", "imaging", "labs", "prescriptions"] as const).map((tab) => (<div key={tab} className={`${styles.recordsTab} ${activeTab === tab ? styles.activeTab : ""}`} onClick={() => setActiveTab(tab)}>{tab}</div>))}</div>
              <div className={styles.recordsList}><List header={header as any} data={data as any} gridTemplateColumns={cols} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientPortalView;