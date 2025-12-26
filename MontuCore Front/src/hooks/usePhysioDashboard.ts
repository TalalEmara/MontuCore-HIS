import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

// ... (Interfaces omitted) ...

const fetchPhysiotherapistDashboard = async (
  physioId: number,
  token: string,
  API_URL: string = `http://localhost:3000/api`
): Promise<any> => {
  const response = await fetch(`${API_URL}/physio-therapist/dashboard/${physioId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch physiotherapist dashboard');
  }
  return response.json();
};

export const usePhysiotherapistDashboard = (physioId: number) => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard', 'physiotherapist', physioId],
    queryFn: () => fetchPhysiotherapistDashboard(physioId, token!),
    enabled: !!physioId && !!token,
    placeholderData: keepPreviousData,
  });
};