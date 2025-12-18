import { useQuery, keepPreviousData } from '@tanstack/react-query';

// --- 1. Interfaces ---

export interface UserStub {
  id: number;
  fullName: string;
  email: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// -- Sub-Entities --

export interface AthleteCase {
  id: number;
  diagnosisName: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  status: string;
  injuryDate: string;
  athlete: UserStub;
  managingClinician: UserStub;
}

export interface AthleteAppointment {
  id: number;
  scheduledAt: string;
  status: string;
  clinician?: UserStub; 
}

export interface Treatment {
  id: number;
  type: string;
  description: string;
  providerName: string;
  date: string;
  cost: number;
  medicalCase: {
    diagnosisName: string;
  };
}

export interface ImagingExam {
  id: number;
  modality: string;
  bodyPart: string;
  status: string;
  scheduledAt: string;
  performedAt?: string;
  radiologistNotes?: string;
  conclusion?: string;
  medicalCase: {
    diagnosisName: string;
  };
  images: string[];
}

export interface LabTest {
  id: number;
  testName: string;
  category: string;
  status: string;
  resultPdfUrl?: string | null;
  resultValues?: Record<string, number | string>;
  labTechnicianNotes?: string | null;
  sampleDate: string;
  cost: number;
  medicalCase: {
    diagnosisName: string;
  };
}

// -- Main Data Structure --

export interface AthleteDashboardData {
  upcomingAppointments: {
    count: number;
    appointments: AthleteAppointment[];
  };
  report: {
    count: number;
    cases: AthleteCase[];
  };
  prescriptions: {
    treatments: Treatment[];
    pagination: PaginationMeta;
  };
  imaging: {
    exams: ImagingExam[];
    pagination: PaginationMeta;
  };
  tests: {
    labTests: LabTest[];
    pagination: PaginationMeta;
  };
}

// -- API Response Wrapper --

export interface AthleteDashboardResponse {
  success: boolean;
  data: AthleteDashboardData;
  message?: string;
}

// -- Hook Return Type --

export interface AthleteDashboardResult {
  dashboard: AthleteDashboardData;
  message: string;
}

// --- 2. API Fetcher ---

const fetchAthleteDashboard = async (
  athleteId: number,
  page: number,
  limit: number,
  // Added API_URL as an argument with default value
  API_URL: string = `http://localhost:3000/api` 
): Promise<AthleteDashboardResponse> => {
  // const token = localStorage.getItem('token');

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  // Updated to use the API_URL argument
  const response = await fetch(`${API_URL}/athlete/dashboard/${athleteId}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch athlete dashboard');
  }

  return response.json();
};

// --- 3. Custom Hook ---

export const useAthleteDashboard = (
  athleteId: number,
  page: number = 1,
  limit: number = 4
) => {
  const queryInfo = useQuery({
    queryKey: ['dashboard', 'athlete', athleteId, page, limit],
    queryFn: () => fetchAthleteDashboard(athleteId, page, limit),
    
    enabled: !!athleteId,
    placeholderData: keepPreviousData,

    select: (response): AthleteDashboardResult => ({
      dashboard: response.data,
      message: response.message || 'Dashboard loaded successfully',
    }),
  });

  return {
    ...queryInfo,
    dashboard: queryInfo.data?.dashboard,
    message: queryInfo.data?.message,
  };
};