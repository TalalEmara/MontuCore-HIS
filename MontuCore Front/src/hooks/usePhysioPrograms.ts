import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type { PhysioProgram } from '../types/models';

export interface PhysioProgramsResponse {
  success: boolean;
  data: PhysioProgram[];
}

const fetchPhysioPrograms = async (token: string): Promise<PhysioProgramsResponse> => {
  const response = await fetch(`http://localhost:3000/api/physio-programs?limit=50`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch physio programs');
  }
  return response.json();
};

export const usePhysioPrograms = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['physio-programs'],
    queryFn: () => fetchPhysioPrograms(token!),
    enabled: !!token,
    select: (response) => response.data,
  });
};