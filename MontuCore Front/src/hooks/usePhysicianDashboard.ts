import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

// ... (Interfaces omitted for brevity, keep your existing ones) ...
export interface PhysicianDashboardResult { dashboard: any; message: string; }

const fetchPhysicianDashboard = async (
  clinicianId: number, 
  page: number, 
  limit: number,
  token: string, // Accept token
  API_URL: string = `http://localhost:3000/api` 
): Promise<any> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_URL}/physician/dashboard/${clinicianId}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
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
  const { token } = useAuth();
  
  const queryInfo = useQuery({
    queryKey: ['dashboard', 'physician', clinicianId, page, limit],
    queryFn: () => fetchPhysicianDashboard(clinicianId, page, limit, token!),
    enabled: !!clinicianId && !!token,
    placeholderData: keepPreviousData,
    select: (response): PhysicianDashboardResult => ({
      dashboard: response.data,
      message: response.message
    }),
  });

  return {
    ...queryInfo,
    dashboard: queryInfo.data?.dashboard,
    message: queryInfo.data?.message,
  };
};