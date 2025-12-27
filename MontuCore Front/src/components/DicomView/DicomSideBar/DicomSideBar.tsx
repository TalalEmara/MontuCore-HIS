import React, { useState } from 'react';
import styles from './DicomSidebar.module.css';
import List from '../../level-0/List/List';
import Button from '../../level-0/Button/Bottom';
import TextInput from '../../level-0/TextInput/TextInput';
import { Activity, BrainCircuit } from 'lucide-react'; // Added icons for visual flair

export interface AnalysisData {
  primary: string;
  severity: 'normal' | 'low' | 'moderate' | 'high';
  details: string;
}

interface DicomSidebarProps {
  patientId: string | number;
  patientName: string;
  onExamClick: (examId: number) => void;
  
  // --- NEW: CDSS Props ---
  onAnalyzeClick?: () => void;
  isAnalyzing?: boolean;
  cdssResult?: AnalysisData | null;
}

// Mock Data
const MOCK_EXAMS = [
  { id: 101, name: 'Knee MRI (Left)', date: '2024-10-23', status: 'Completed' },
  { id: 102, name: 'Knee X-Ray', date: '2024-09-15', status: 'Reviewed' },
  { id: 103, name: 'CT Scan', date: '2024-08-01', status: 'Archived' },
  { id: 104, name: 'Shoulder MRI', date: '2024-07-10', status: 'Completed' },
  { id: 105, name: 'Ankle X-Ray', date: '2024-06-20', status: 'Reviewed' },
  { id: 106, name: 'Head CT', date: '2024-05-15', status: 'Completed' },
  { id: 107, name: 'Spine MRI', date: '2024-04-10', status: 'Completed' },
];

export const DicomSidebar: React.FC<DicomSidebarProps> = ({ 
  patientId, 
  patientName, 
  onExamClick,
  onAnalyzeClick,
  isAnalyzing = false,
  cdssResult
}) => {
  const [activeTab, setActiveTab] = useState<'images' | 'notes'>('images');
  const [noteText, setNoteText] = useState('');
  
  const [savedNotes, setSavedNotes] = useState([
    { id: 1, date: '2024-10-24 10:30 AM', text: 'Patient reported mild discomfort during the scan.' }
  ]);

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    const newNote = { id: Date.now(), date: new Date().toLocaleString(), text: noteText };
    setSavedNotes([newNote, ...savedNotes]);
    setNoteText('');
  };

  const handleRowClick = (index: number) => {
    const selectedExam = MOCK_EXAMS[index];
    if (selectedExam) onExamClick(selectedExam.id);
  };

  const listHeader = ['Exam', 'Date', 'Status'];
  const listData = MOCK_EXAMS.map(exam => [
    exam.name,
    exam.date,
    <span style={{ color: exam.status === 'Completed' ? '#4ade80' : '#fbbf24', fontSize: '0.8rem' }}>
      {exam.status}
    </span>
  ]);

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
          className={`${styles.tabButton} ${activeTab === 'images' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('images')}
        >
          Images
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'notes' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'images' ? (
          <List 
            header={listHeader}
            data={listData}
            onRowClick={handleRowClick}
            gridTemplateColumns="1.5fr 1fr 1fr"
          />
        ) : (
          <div className={styles.notesContainer}>
            
            {/* --- NEW: CDSS SECTION --- */}
            <div className={styles.cdssContainer}>
               <div className={styles.sectionTitle}>
                  <BrainCircuit size={16} />
                  CDSS AI Analysis
               </div>
               
               {/* Read-Only Outcome Label */}
               <div className={`${styles.cdssResultBox} ${cdssResult ? styles[cdssResult.severity] : styles.empty}`}>
                  {cdssResult ? (
                    <>
                      <div className={styles.cdssLabel}>{cdssResult.primary}</div>
                      <div className={styles.cdssDetails}>{cdssResult.details}</div>
                    </>
                  ) : (
                    <span className={styles.placeholderText}>No analysis performed yet.</span>
                  )}
               </div>

               {/* Analyze Button */}
               <Button 
                  onClick={onAnalyzeClick} 
                  disabled={isAnalyzing} 
                  variant={isAnalyzing ? 'secondary' : 'primary'}
               >
                 {isAnalyzing ? "Analyzing..." : "Analyze CDSS"}
               </Button>
            </div>

            <hr className={styles.divider} />

          

            {/* Notes History */}
            <div className={styles.notesHistory}>
               <div className={styles.sectionTitle} style={{fontSize: '0.8rem'}}>
                  <Activity size={14} /> History
               </div>
               {savedNotes.map(note => (
                 <div key={note.id} className={styles.noteItem}>
                    <div className={styles.noteDate}>{note.date}</div>
                    <div className={styles.noteText}>{note.text}</div>
                 </div>
               ))}
            </div>
              {/* Input Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <TextInput 
                  label="Clinical Notes" 
                  value={noteText}
                  onChange={(val) => setNoteText(val)}
                  placeholder="Type findings here..."
                  height="20rem"
                />
                <Button onClick={handleSaveNote} variant="secondary">Add Note</Button>
            </div>

            <hr className={styles.divider} />
          </div>
        )}
      </div>
    </div>
  );
};