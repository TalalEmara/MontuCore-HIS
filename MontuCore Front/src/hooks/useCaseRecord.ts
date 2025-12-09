// src/hooks/useCaseRecord.ts
import { useQuery } from '@tanstack/react-query';


export interface CaseAthlete {
  id: number;
  email: string;
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  gender: string;
  role: string;
}

export interface CaseClinician {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface OriginAppointment {
  id: number;
  scheduledAt: string;
  height: number;
  weight: number;
  status: string;
  diagnosisNotes: string;
}

export interface Exam {
  id: number;
  modality: string;
  bodyPart: string;
  status: string;
  scheduledAt: string;
  performedAt: string;
  radiologistNotes: string;
  conclusion: string;
  cost: number;
//   images: any[]; // You can define a specific Image type if needed
}

export interface LabTest {
  id: number;
  testName: string;
  category: string;
  status: string;
  resultValues: Record<string, number | string>; 
  sampleDate: string;
  cost: number;
}

export interface Treatment {
  id: number;
  type: string;
  description: string;
  providerName: string;
  cost: number;
  date: string;
}

export interface PhysioProgram {
  id: number;
  title: string;
  numberOfSessions: number;
  sessionsCompleted: number;
  startDate: string;
  weeklyRepetition: number;
  costPerSession: number;
}

export interface CaseRecord {
  id: number;
  athleteId: number;
  managingClinicianId: number;
  appointmentId: number;
  diagnosisName: string;
  icd10Code: string;
  injuryDate: string;
  status: string;
  severity: string;
  medicalGrade: string;
  athlete: CaseAthlete;
  managingClinician: CaseClinician;
  originAppointment: OriginAppointment;
  exams: Exam[];
  labTests: LabTest[];
  treatments: Treatment[];
  physioPrograms: PhysioProgram[];
}

export interface CaseRecordResponse {
  success: boolean;
  data: CaseRecord;
}

const fetchCaseRecord = async (id: string | number): Promise<CaseRecordResponse> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`http://localhost:3000/api/cases/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch case record');
  }

  return response.json();
};


export const useCaseRecord = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ['caseRecord', id],
    queryFn: () => fetchCaseRecord(id!),
    enabled: !!id, // Only fetch if ID is present
    select: (response) => response.data,
  });
};