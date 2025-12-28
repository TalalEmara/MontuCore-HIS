import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import type { 
  Appointment, 
  MedicalCase, 
  Treatment, 
  Exam, 
  LabTest 
} from '../types/models';
// --- 1. Interfaces ---

// export interface UserStub {
//   id: number;
//   fullName: string;
//   email: string;
// }

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// // -- Sub-Entities --

// export interface AthleteCase {
//   id: number;
//   diagnosisName: string;
//   severity: 'MILD' | 'MODERATE' | 'SEVERE';
//   status: string;
//   injuryDate: string;
//   athlete: UserStub;
//   managingClinician: UserStub;
// }

// export interface AthleteAppointment {
//   id: number;
//   scheduledAt: string;
//   status: string;
//   clinician?: UserStub;
//   // Added height and weight as optional properties since they might not exist on all appointments
//   height?: number; 
//   weight?: number;
// }

// export interface Treatment {
//   id: number;
//   type: string;
//   description: string;
//   providerName: string;
//   date: string;
//   cost: number;
//   medicalCase: {
//     diagnosisName: string;
//   };
// }

// export interface ImagingExam {
//   id: number;
//   modality: string;
//   bodyPart: string;
//   status: string;
//   scheduledAt: string;
//   performedAt?: string;
//   radiologistNotes?: string;
//   conclusion?: string;
//   medicalCase: {
//     diagnosisName: string;
//   };
//   images: string[];
// }

// export interface LabTest {
//   id: number;
//   testName: string;
//   category: string;
//   status: string;
//   resultPdfUrl?: string | null;
//   resultValues?: Record<string, number | string>;
//   labTechnicianNotes?: string | null;
//   sampleDate: string;
//   cost: number;
//   medicalCase: {
//     diagnosisName: string;
//   };
// }

// // -- Main Data Structure --

export interface AthleteDashboardData {
  upcomingAppointments: {
    count: number;
    appointments: Appointment[];
  };
  report: {
    count: number;
    cases: MedicalCase[];
  };
  prescriptions: {
    treatments: Treatment[];
    pagination: PaginationMeta;
  };
  imaging: {
    exams: Exam[];
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

const TAB_ENDPOINTS: Record<string, string> = {
  prescriptions: 'treatments',
  imaging: 'exams',
  'Lab tests': 'lab-tests',
  reports: 'cases',
};

// --- 2. API Fetcher ---

const fetchAthleteDashboard = async (
  athleteId: number,
  page: number,
  limit: number,
  token: string,
  activeTab: string, 
  API_URL: string = `http://localhost:3000/api`
): Promise<AthleteDashboardResponse> => {
  
  // Logic: Use dashboard for page 1, dedicated endpoint for page 2+
  let url = `${API_URL}/athlete/dashboard/${athleteId}`;
  
  if (page > 1) {
    const segment = TAB_ENDPOINTS[activeTab] || 'treatments';
    url = `${API_URL}/${segment}`;
  }

  const params = new URLSearchParams({
    athleteId: athleteId.toString(),
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${url}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch data');
  return response.json();
};

// --- 3. Custom Hook ---
export const useAthleteDashboard = (
  athleteId: number,
  page: number = 1,
  limit: number = 1,
  activeTab: string
) => {
  const page1DataRef = useRef<AthleteDashboardData | null>(null);
  const { token } = useAuth();

  const queryInfo = useQuery({
    queryKey: ['dashboard', 'athlete', athleteId, page, activeTab],
    queryFn: () => fetchAthleteDashboard(athleteId, page, limit, token!, activeTab),
    enabled: !!athleteId && !!token,
    placeholderData: keepPreviousData,

    select: (response): AthleteDashboardResult => {
      const data = response.data;

      // For page 1, store the data
      if (page === 1) {
        page1DataRef.current = data;
      }

      //  PAGE 2+
      if (page > 1) {
        // Merge with page 1 data to keep appointments and other tabs' data
        const baseData = page1DataRef.current || {
          upcomingAppointments: { appointments: [] },
          report: { cases: [] },
          prescriptions: { treatments: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } },
          imaging: { exams: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } },
          tests: { labTests: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } },
          latestVitals: { height: null, weight: null, status: 'Loading...' }
        };

        return {
          dashboard: {
            ...baseData,
            // Update only the active tab's data
            report: activeTab === 'reports' ? { cases: (data as any).cases || [], pagination: (data as any).pagination } : baseData.report,
            prescriptions: activeTab === 'prescriptions' ? { treatments: (data as any).treatments || [], pagination: (data as any).pagination } : baseData.prescriptions,
            imaging: activeTab === 'imaging' ? { exams: (data as any).exams || [], pagination: (data as any).pagination } : baseData.imaging,
            tests: activeTab === 'Lab tests' ? { labTests: (data as any).labTests || [], pagination: (data as any).pagination } : baseData.tests,
          } as any,
          message: "Page loaded",
        };
      }

      
      const fixMeta = (items: any[], meta: PaginationMeta) => ({
        ...meta,
        totalPages: Math.max(meta?.totalPages || 1, Math.ceil(items.length / limit))
      });

      const sortedCases = [...(data.report?.cases || [])].sort((a, b) => 
        new Date(b.injuryDate).getTime() - new Date(a.injuryDate).getTime()
      );

     const sortedAppointments = [...data.upcomingAppointments.appointments].sort((a, b) => 
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

      // 4. Find latest Height and Weight
      // We iterate through the sorted appointments to find the most recent non-null value for each
      let lastHeight: number | null = null;
      let lastWeight: number | null = null;
      for (const appt of sortedAppointments) {
        if (lastHeight === null && appt.height) lastHeight = appt.height;
        if (lastWeight === null && appt.weight) lastWeight = appt.weight;
        if (lastHeight && lastWeight) break;
      }

      return {
        dashboard: {
          ...data,
          report: { 
            ...data.report, 
            cases: sortedCases 
          },
          prescriptions: {
            ...data.prescriptions,
            pagination: fixMeta(data.prescriptions.treatments, data.prescriptions.pagination)
          },
          imaging: {
            ...data.imaging,
            pagination: fixMeta(data.imaging.exams, data.imaging.pagination)
          },
          tests: {
            ...data.tests,
            pagination: fixMeta(data.tests.labTests, data.tests.pagination)
          },
          latestVitals: {
            height: lastHeight,
            weight: lastWeight,
            status: sortedCases[0]?.status || 'Fit',
          },
        },
        message: response.message || 'Success',
      };
    },
  });

  return { ...queryInfo, dashboard: queryInfo.data?.dashboard };
};