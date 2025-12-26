import React from 'react';
import BasicOverlay from '../../level-0/Overlay/BasicOverlay';
import List from '../../level-0/List/List';
import styles from './Details.module.css'; // Shared CSS for details
import { StatusBadge, Status } from '../../level-0/Badge/badge';

// Matches Prisma 'LabTest'
interface LabTestData {
  id: number;
  testName: string;
  category: string;
  status: Status;
  sampleDate: string;
  labTechnicianNotes?: string;
  resultValues?: Record<string, string | number>; // JSON field
  cost: number;
  resultPdfUrl?: string;
}

const mockLabTest: LabTestData = {
  id: 101,
  testName: "Comprehensive Metabolic Panel (CMP)",
  category: "Biochemistry",
  status: Status.Pending,
  sampleDate: "2024-12-20T08:30:00Z",
  cost: 120.50,
  labTechnicianNotes: "Sample slightly hemolyzed, but results valid.",
  resultValues: {
    "Glucose": "95 mg/dL",
    "Calcium": "9.8 mg/dL",
    "Sodium": "140 mmol/L",
    "Potassium": "4.2 mmol/L"
  },
  resultPdfUrl: "/reports/lab-101.pdf"
};

export default function LabTestDetail({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  
  // Transform JSON object to List data format [[key, value], ...]
  const resultsData = mockLabTest.resultValues 
    ? Object.entries(mockLabTest.resultValues).map(([k, v]) => [k, v])
    : [];

  return (
    <BasicOverlay isOpen={isOpen} onClose={onClose} title="Lab Test Details">
      
      {/* Overview Section */}
      <div className={styles.section}>
        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.label}>Test Name</span>
            <span className={styles.valueLarge}>{mockLabTest.testName}</span>
          </div>
          <StatusBadge status={mockLabTest.status} />
        </div>
        
        <div className={styles.grid}>
           <div className={styles.field}>
              <span className={styles.label}>Category</span>
              <span>{mockLabTest.category}</span>
           </div>
           <div className={styles.field}>
              <span className={styles.label}>Sample Date</span>
              <span>{new Date(mockLabTest.sampleDate).toLocaleDateString()}</span>
           </div>
           <div className={styles.field}>
              <span className={styles.label}>Cost</span>
              <span>${mockLabTest.cost}</span>
           </div>
        </div>
      </div>

      {/* Results Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Results</h3>
        <List header={["Parameter", "Value"]} data={resultsData} />
      </div>

      {/* Notes Section */}
      {mockLabTest.labTechnicianNotes && (
        <div className={styles.section}>
           <h3 className={styles.sectionTitle}>Technician Notes</h3>
           <p className={styles.text}>{mockLabTest.labTechnicianNotes}</p>
        </div>
      )}

      {/* Action Footer */}
      {mockLabTest.resultPdfUrl && (
         <div className={styles.footer}>
            <button className={styles.primaryButton}>Download PDF Report</button>
         </div>
      )}
      
    </BasicOverlay>
  );
}