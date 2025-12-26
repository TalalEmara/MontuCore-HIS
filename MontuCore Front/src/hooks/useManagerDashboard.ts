import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

// ... (Interfaces omitted) ...
export interface ManagerDashboardResult { dashboard: any; message: string; }

const fetchManagerDashboard = async (
  page: number,
  limit: number,
  token: string, // Accept token
  API_URL: string = `http://localhost:3000/api`
): Promise<any> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_URL}/dashboard/manager/dashboard?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('Unauthorized: Please log in again.');
    throw new Error(errorData.message || 'Failed to fetch manager dashboard');
  }
  return response.json();
};

export const useManagerDashboard = (page: number = 1, limit: number = 10) => {
  const { token } = useAuth();

  const queryInfo = useQuery({
    queryKey: ['dashboard', 'manager', page, limit],
    queryFn: () => fetchManagerDashboard(page, limit, token!),
    enabled: !!token, // Only run if token exists
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