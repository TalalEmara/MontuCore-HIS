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

// --- Interfaces ---

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

// -- Main Data Structure for UI (Flattened) --
export interface CaseRecordData extends MedicalCase {
  exams: Exam[];
  labTests: LabTest[];
  treatments: Treatment[];
  physioPrograms: PhysioProgram[];
  appointments: Appointment[]; // Added appointments
}

// -- Raw API Response Interfaces --
interface ApiListResponse<T> {
  count: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: T[];
}

interface CaseViewApiResponse {
  success: boolean;
  data: {
    case: MedicalCase;
    appointments: ApiListResponse<Appointment>;
    treatments: ApiListResponse<Treatment>;
    exams: ApiListResponse<Exam>;
    labTests: ApiListResponse<LabTest>;
    physioPrograms: ApiListResponse<PhysioProgram>;
  };
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
    return null; 
  }
  return response.json();
};

const fetchCaseRecord = async (
  caseId: number,
  token: string,
  API_URL: string = `http://localhost:3000/api`
): Promise<CaseViewApiResponse> => {
  // UPDATED ENDPOINT: /case-view/${caseId}
  const response = await fetch(`${API_URL}/case-view/${caseId}`, {
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
    
    // Transform the nested API response into the flat structure the View uses
    select: (response): CaseRecordResult => {
      const { data } = response;
      
      const flatRecord: CaseRecordData = {
        ...data.case, // Spread the base case details (id, diagnosis, athlete, etc.)
        appointments: data.appointments?.data || [],
        treatments: data.treatments?.data || [],
        exams: data.exams?.data || [],
        labTests: data.labTests?.data || [],
        physioPrograms: data.physioPrograms?.data || [],
      };

      return {
        caseRecord: flatRecord,
        message: response.message || 'Case record loaded successfully',
      };
    },
  });

  return {
    ...queryInfo,
    caseRecord: queryInfo.data?.caseRecord,
    message: queryInfo.data?.message,
  };
};