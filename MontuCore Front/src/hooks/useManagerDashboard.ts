import { useQuery, keepPreviousData } from '@tanstack/react-query';

// --- 1. Interfaces ---

export interface ManagerUserStub {
  id: number;
  fullName: string;
}

export interface CaseSeverityStats {
  critical: number;
  severe: number;
  moderate: number;
  mild: number;
}

export interface ManagerCaseStats {
  total: number;
  active: number;
  recovered: number;
  severity: CaseSeverityStats;
}

export interface ManagerFinancials {
  totalSpend: number;
}

export interface ManagerAppointmentStats {
  completed: number;
  cancelled: number;
  scheduled: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
}

// -- Main Data Structure --

export interface ManagerDashboardData {
  financials: ManagerFinancials;
  cases: ManagerCaseStats;
  appointments: ManagerAppointmentStats;
  athletes: ManagerUserStub[];
  clinicians: ManagerUserStub[];
  pagination: PaginationMeta;
}

// -- API Response Wrapper --

export interface ManagerDashboardResponse {
  success: boolean;
  data: ManagerDashboardData;
  message?: string;
}

// -- Hook Return Type --

export interface ManagerDashboardResult {
  dashboard: ManagerDashboardData;
  message: string;
}

// --- 2. API Fetcher ---

const fetchManagerDashboard = async (
  page: number,
  limit: number,
  API_URL: string = `http://localhost:3000/api`
): Promise<ManagerDashboardResponse> => {
  
//   const token = localStorage.getItem('token');
 const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoidGVzdEBzcG9ydHNoaXMuY29tIiwicm9sZSI6IkNMSU5JQ0lBTiIsImlhdCI6MTc2NjY4NzgyNywiZXhwIjoxNzY2Nzc0MjI3fQ.DEFhmEeBJ90FUQ5_4AsdQnoJtaBm4a-Vt5yRPyoSLDY"
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_URL}/dashboard/manager/dashboard?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 2. Add Authorization header (Uncommented)
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // Attempt to parse error message, fallback to status text
    const errorData = await response.json().catch(() => ({}));
    
    // Specifically handle 401 to help with debugging
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in again.');
    }
    
    throw new Error(errorData.message || 'Failed to fetch manager dashboard');
  }

  return response.json();
};

// --- 3. Custom Hook ---

export const useManagerDashboard = (
  page: number = 1,
  limit: number = 10
) => {
  const queryInfo = useQuery({
    queryKey: ['dashboard', 'manager', page, limit],
    queryFn: () => fetchManagerDashboard(page, limit),
    
    placeholderData: keepPreviousData,

    select: (response): ManagerDashboardResult => ({
      dashboard: response.data,
      message: response.message || 'Manager dashboard loaded successfully',
    }),
  });

  return {
    ...queryInfo,
    dashboard: queryInfo.data?.dashboard,
    message: queryInfo.data?.message,
  };
};