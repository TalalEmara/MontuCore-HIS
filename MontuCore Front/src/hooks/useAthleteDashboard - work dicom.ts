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
  // Added height and weight as optional properties since they might not exist on all appointments
  height?: number; 
  weight?: number;
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
  dicomFileName?: string;
  dicomPublicUrl?: string;
  dicomUploadedAt?: string;
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
  // New Field for the derived data
  latestVitals?: {
    height: number | null;
    weight: number | null;
    status: string;
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
  API_URL: string = `http://localhost:3000/api` 
): Promise<AthleteDashboardResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
   const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBzcG9ydHNoaXMuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2NzE0OTcxLCJleHAiOjE3NjY5NzQxNzF9.VxkUskovzCmRIyOwHfFlrF6RLb2k794pIgGf4VSJ7Z0";

  const response = await fetch(`${API_URL}/athlete/dashboard/${athleteId}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
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

    select: (response): AthleteDashboardResult => {
      const data = response.data;

      // 1. Sort Cases by Time (Most recent first)
      const sortedCases = [...data.report.cases].sort((a, b) => 
        new Date(b.injuryDate).getTime() - new Date(a.injuryDate).getTime()
      );

      // 2. Determine Status (Fit if no cases, otherwise status of most recent case)
      const latestStatus = sortedCases.length > 0 ? sortedCases[0].status : 'Fit';

      // 3. Sort Appointments by Time (Most recent first)
      const sortedAppointments = [...data.upcomingAppointments.appointments].sort((a, b) => 
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      );

      // 4. Find latest Height and Weight
      // We iterate through the sorted appointments to find the most recent non-null value for each
      let lastHeight: number | null = null;
      let lastWeight: number | null = null;

      for (const appt of sortedAppointments) {
        if (lastHeight === null && appt.height !== undefined && appt.height !== null) {
          lastHeight = appt.height;
        }
        if (lastWeight === null && appt.weight !== undefined && appt.weight !== null) {
          lastWeight = appt.weight;
        }
        // If we found both, stop looking
        if (lastHeight !== null && lastWeight !== null) break;
      }

      // 5. Construct the Augmented Dashboard Object
      const augmentedDashboard: AthleteDashboardData = {
        ...data,
        report: {
          ...data.report,
          cases: sortedCases, // Return the sorted cases
        },
        upcomingAppointments: {
            ...data.upcomingAppointments,
            appointments: sortedAppointments // Return sorted appointments
        },
        latestVitals: {
          height: lastHeight,
          weight: lastWeight,
          status: latestStatus,
        },
      };

      return {
        dashboard: augmentedDashboard,
        message: response.message || 'Dashboard loaded successfully',
      };
    },
  });

  return {
    ...queryInfo,
    dashboard: queryInfo.data?.dashboard,
    message: queryInfo.data?.message,
  };
};