import { useQuery, keepPreviousData } from '@tanstack/react-query';

// ---  Interfaces ---

export interface DashboardUserStub {
  id: number;
  fullName: string;
  email: string;
}

export interface DashboardCase {
  id: number;
  diagnosisName: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  status: string;
  injuryDate: string;
  athlete: DashboardUserStub;
  managingClinician: DashboardUserStub;
}

export interface DashboardAppointment {
  id: number;
  scheduledAt: string;
  status: string;
  athlete: DashboardUserStub;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// The inner data object
export interface DashboardData {
  todaysAppointments: {
    count: number;
    appointments: DashboardAppointment[];
  };
  criticalCases: {
    count: number;
    cases: DashboardCase[];
  };
  activeCases: {
    cases: DashboardCase[];
    pagination: PaginationMeta;
  };
}

// The raw API response
export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message: string;
}

// The "Clean" return type for your Component
export interface PhysicianDashboardResult {
  dashboard: DashboardData; 
  message: string;         
}


const fetchPhysicianDashboard = async (
  clinicianId: number, 
  page: number, 
  limit: number,
  API_URL: string = `http://localhost:3000/api` 
): Promise<DashboardResponse> => {
  const token = localStorage.getItem('token');
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_URL}/physician/dashboard/${clinicianId}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    //   'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch dashboard data');
  }

  return response.json();
};

export const usePhysicianDashboard = (
  clinicianId: number, 
  page: number = 1, 
  limit: number = 10
) => {
  const queryInfo = useQuery({
    queryKey: ['dashboard', 'physician', clinicianId, page, limit],
    queryFn: () => fetchPhysicianDashboard(clinicianId, page, limit),
    enabled: !!clinicianId,
    placeholderData: keepPreviousData,

    select: (response): PhysicianDashboardResult => ({
      dashboard: response.data,
      message: response.message
    }),
  });

  return {
    // spread existing properties (isLoading, isError, refetch, etc.)
    ...queryInfo,
    dashboard: queryInfo.data?.dashboard,
    message: queryInfo.data?.message,
  };
};