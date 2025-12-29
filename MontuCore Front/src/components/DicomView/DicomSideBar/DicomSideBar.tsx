import React, { useState } from "react";
import styles from "./DicomSidebar.module.css";
import List from "../../level-0/List/List";
import Button from "../../level-0/Button/Bottom";
import TextInput from "../../level-0/TextInput/TextInput";
import { Activity, BrainCircuit, Upload } from "lucide-react";
import { type CDSSDiagnosis } from "../../../hooks/DicomViewer/useCDSS";
import { type Exam } from "../../../types/models"; // Import Exam type

interface DicomSidebarProps {
  patientId: string | number;
  patientName: string;
  caseId?: string | number | null;
  // --- UPDATED: Pass real exams here ---
  exams: Exam[]; 
  onExamClick: (examId: number) => void;
  radiologistNotes?: string | null;
  onAnalyzeClick?: () => void;
  isAnalyzing?: boolean;
  cdssResult?: CDSSDiagnosis | null;
  onLocalUpload: (files: FileList) => void;
}

export const DicomSidebar: React.FC<DicomSidebarProps> = ({
  patientId,
  patientName,
  caseId,
  exams, // <--- Receive real exams
  onExamClick,
  onAnalyzeClick,
  isAnalyzing = false,
  cdssResult,
  radiologistNotes,
  onLocalUpload,
}) => {
  const [activeTab, setActiveTab] = useState<"images" | "notes">("images");
  const [noteText, setNoteText] = useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [savedNotes, setSavedNotes] = useState([
    {
      id: 1,
      date: "2024-10-24 10:30 AM",
      text: "Patient reported mild discomfort during the scan.",
    },
  ]);
  // --- Helper to format date ---
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // --- Helper to map status color ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IMAGING_COMPLETE': return '#4ade80'; // Green
      case 'REPORT_AVAILABLE': return '#4ade80';
      case 'SCHEDULED': return '#fbbf24'; // Yellow
      default: return '#9ca3af'; // Grey
    }
  };

  // --- Transform Data for List Component ---
  const listHeader = ["Exam", "Date", "Status"];
  
  // Sort exams by performedAt date (most recent first)
  const sortedExams = [...exams].sort((a, b) => {
    const dateA = new Date(a.performedAt || a.scheduledAt || 0);
    const dateB = new Date(b.performedAt || b.scheduledAt || 0);
    return dateB.getTime() - dateA.getTime(); // Descending order
  });
  
  const listData = sortedExams.map((exam) => [
    `${exam.bodyPart} ${exam.modality}`, // e.g. "Knee MRI"
    formatDate(exam.performedAt || exam.scheduledAt),
    <span style={{ color: getStatusColor(exam.status), fontSize: "0.8rem" }}>
      {exam.status.replace('_', ' ')}
    </span>,
  ]);
 const handleSaveNote = () => {
    if (!noteText.trim()) return;
    const newNote = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      text: noteText,
    };
    setSavedNotes([newNote, ...savedNotes]);
    setNoteText("");
  };
  const handleRowClick = (index: number) => {
    const selectedExam = sortedExams[index];
    if (selectedExam) onExamClick(selectedExam.id);
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onLocalUpload(e.target.files);
      e.target.value = ""; 
    }
  };

  return (
    <div className={styles.sidebarContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.patientName}>{patientName}</h3>
        <div className={styles.patientId}>ID: #{patientId}</div>
      </div>

      {/* Tabs */}
      <div className={styles.tabGroup}>
        <button
          className={`${styles.tabButton} ${activeTab === "images" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("images")}
        >
          Images
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "notes" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("notes")}
        >
          Notes
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === "images" ? (
          <>
            <div style={{ padding: "10px", borderBottom: "1px solid #3f3f46" }}>
              <input
                type="file"
                multiple
                accept=".dcm, application/dicom"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <Button onClick={handleUploadClick} variant="secondary">
                <Upload size={16} /> 
                Compare Local File
              </Button>
            </div>
            {/* RENDER THE LIST WITH REAL DATA */}
            <div style={{ padding: "10px", fontSize: "0.9rem", color: "#666", borderBottom: "1px solid #3f3f46" }}>
              {sortedExams.length} exam{sortedExams.length !== 1 ? 's' : ''} found{caseId ? ` for Case #${caseId}` : ''}
            </div>
            <List
              header={listHeader}
              data={listData}
              onRowClick={handleRowClick}
              gridTemplateColumns="1.5fr 1fr 1fr"
            />
            {sortedExams.length === 0 && (
              <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
                No exams found{caseId ? ` for Case #${caseId}` : ' for this patient'}.
              </div>
            )}
          </>
        ) : (
            // ... (Notes section remains unchanged)
                 <div className={styles.notesContainer}>
            {/* --- NEW: CDSS SECTION --- */}
            <div className={styles.cdssContainer}>
              <div className={styles.sectionTitle}>
                <BrainCircuit size={16} />
                CDSS AI Analysis
              </div>

              {/* Read-Only Outcome Label */}
              <div
                className={`${styles.cdssResultBox} ${
                  cdssResult ? styles[cdssResult.severity] : styles.empty
                }`}
              >
                {cdssResult ? (
                  <>
                    <div className={styles.cdssLabel}>{cdssResult.primary}</div>
                    <div className={styles.cdssDetails}>
                      {cdssResult.details}
                    </div>
                    {/* RENDER THE HEATMAP IMAGE(S) */}
                      {cdssResult.heatmap && cdssResult.heatmap.length > 0 && (
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                            Activation Map
                          </div>
                          
                            <img 
                              // Ensure you have the correct prefix. 
                              // If your API sends raw base64, use `data:image/png;base64,`
                              src={`data:image/png;base64,${cdssResult.heatmap}`} 
                              alt={`Heatmap `}
                              style={{ 
                                width: '100%', 
                                borderRadius: '4px', 
                                border: '1px solid #cbd5e1',
                                marginBottom: '5px' 
                              }} 
                            />
                        </div>
                      )}
                  </>
                ) : (
                  <span className={styles.placeholderText}>
                    No analysis performed yet.
                  </span>
                )}
              </div>

              {/* Analyze Button */}
              <Button
                onClick={onAnalyzeClick}
                disabled={isAnalyzing}
                variant={isAnalyzing ? "secondary" : "primary"}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze CDSS"}
              </Button>
            </div>

            <hr className={styles.divider} />

            {/* Notes History */}
            <div className={styles.notesHistory}>
              <div
                className={styles.sectionTitle}
                style={{ fontSize: "0.8rem" }}
              >
                <Activity size={14} /> Radiologist Notes
              </div>
              <div className={styles.noteItem}>
                <div className={styles.noteText}>
                  {radiologistNotes
                    ? radiologistNotes
                    : "No radiologist notes available."}
                </div>
              </div>
            </div>
            {/* Input Area */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <TextInput
                label="Clinical Notes"
                value={noteText}
                onChange={(val) => setNoteText(val)}
                placeholder="Type findings here..."
                height="20rem"
              />
              <Button onClick={handleSaveNote} variant="secondary">
                Add Note
              </Button>
            </div>

            <hr className={styles.divider} />
          </div>
        )}
      </div>
    </div>
  );
};