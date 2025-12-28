// src/types/models.ts

// --- Users ---
export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'CLINICIAN' | 'ATHLETE' | 'MANAGER';
  createdAt?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

// Often referenced as a short summary in other objects
export type UserStub = Pick<User, "id" | "fullName" | "email">;

// --- Appointments ---
export interface Appointment {
  id: number;
  athleteId: number;
  clinicianId: number;
  scheduledAt: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'PENDING';
  
  // Vitals often attached to appointments
  height?: number;
  weight?: number;
  
  // Medical Details
  diagnosisNotes?: string;
  
  // Relations
  athlete?: UserStub;
  clinician?: UserStub;
}

// --- Medical Cases ---
export interface MedicalCase {
  id: number;
  diagnosisName: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  status: 'ACTIVE' | 'RECOVERED' | 'RECURRING';
  injuryDate: string;
  medicalGrade?: string;
  
  // Relations
  athlete: UserStub;
  managingClinician: UserStub;
}

// --- Treatments ---
export interface Treatment {
  id: number;
  caseId: number;
  type: string; // e.g. "Surgery", "Physio", "Medication"
  description: string;
  providerName: string;
  date: string;
  cost: number;
  
  // Optional relation often needed in dashboards
  medicalCase?: { diagnosisName: string }; 
}

// --- Imaging / Exams ---
export interface Exam {
  id: number;
  caseId: number;
  modality: string; // "MRI", "X-RAY", etc.
  bodyPart: string;
  status: 'ORDERED' | 'SCHEDULED' | 'IMAGING_COMPLETE' | 'REPORT_AVAILABLE';
  
  scheduledAt: string;
  performedAt?: string;
  radiologistNotes?: string;
  conclusion?: string;
  cost?: number;

  // DICOM specific
  dicomPublicUrl?: string;
  pacsImages?: { id: number; fileName: string; publicUrl: string }[];
  
  // Optional relation
  medicalCase?: { diagnosisName: string };
}

// --- Lab Tests ---
export interface LabTest {
  id: number;
  caseId: number;
  testName: string;
  category: string;
  status: 'PENDING' | 'COMPLETED';
  sampleDate: string;
  cost: number;
  
  // Results
  resultPdfUrl?: string | null;
  resultValues?: Record<string, number | string>;
  labTechnicianNotes?: string | null;
  
  // Optional relation
  medicalCase?: { diagnosisName: string };
}

// --- Physio Programs ---
export interface PhysioProgram {
  id: number;
  caseId: number;
  title: string;
  numberOfSessions: number;
  sessionsCompleted: number;
  startDate: string;
  weeklyRepetition: number;
  costPerSession: number;
}