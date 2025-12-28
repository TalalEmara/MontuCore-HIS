import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type { 
  User, 
  UserDetail,
  Appointment, 
  MedicalCase, 
  Treatment, 
  Exam, 
  LabTest,
  PhysioProgram 
} from '../types/models';
// ... (Interfaces omitted) ...
export interface CaseRecordResult { caseRecord: any; message: string; }

// --- 1. Interfaces ---



export interface CreateCaseRequest {
  athleteId: number;
  managingClinicianId: number;
  initialAppointmentId: number;
  diagnosisName: string;
  icd10Code?: string;
  injuryDate: string;
  status: string;
  severity: string;
  medicalGrade: string;
}
// -- Main Data Structure --

export interface CaseRecordData {
  id: number;
  diagnosisName: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  status: string;
  injuryDate: string;
  athlete: User;
  managingClinician: UserDetail;
  exams: Exam[];
  labTests: LabTest[];
  treatments: Treatment[];
  physioPrograms: PhysioProgram[];
}

// -- API Response Wrapper --

export interface CaseRecordResponse {
  success: boolean;
  data: MedicalCase;
  message?: string;
}

// -- Hook Return Type --

export interface CaseRecordResult {
  caseRecord: CaseRecordData | undefined;
  message: string;
}

// --- 2. API Fetcher ---
export const createCaseApi = async (data: CreateCaseRequest, token: string, API_URL: string = `http://localhost:3000/api`) => {
  const response = await fetch(`${API_URL}/cases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Case creation failed:", errorData);
    return null; // Return null instead of throwing to allow registration chain to continue
  }
  return response.json();
};

const fetchCaseRecord = async (
  caseId: number,
  token: string,
  API_URL: string = `http://localhost:3000/api`
): Promise<any> => {
  const response = await fetch(`${API_URL}/cases/${caseId}`, {
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

export const useCaseRecord = (caseId: number) => {
  const { token } = useAuth();

  const queryInfo = useQuery({
    queryKey: ['caseRecord', caseId],
    queryFn: () => fetchCaseRecord(caseId, token!),
    enabled: !!caseId && !!token,
    placeholderData: keepPreviousData, 
    select: (response): CaseRecordResult => ({
      caseRecord: response.data,
      message: response.message || 'Case record loaded successfully',
    }),
  });

  return {
    ...queryInfo,
    caseRecord: queryInfo.data?.caseRecord,
    message: queryInfo.data?.message,
  };
};