import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type { LabTest } from '../types/models';

export interface LabTestsResponse {
  success: boolean;
  data: LabTest[];
}

const fetchLabTests = async (token: string): Promise<LabTestsResponse> => {
  const response = await fetch(`http://localhost:3000/api/lab-tests?limit=50`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch lab tests');
  }
  return response.json();
};

export const useLabTests = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['lab-tests'],
    queryFn: () => fetchLabTests(token!),
    enabled: !!token,
    select: (response) => response.data,
  });
};