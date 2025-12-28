import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type { MedicalCase } from '../types/models';

export interface CasesResponse {
  success: boolean;
  data: {
    cases: MedicalCase[];
  };
}

const fetchCases = async (token: string): Promise<CasesResponse> => {
  // Hardcoded limit to get "all" relevant active cases for now
  const response = await fetch(`http://localhost:3000/api/cases?limit=50`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cases');
  }
  return response.json();
};

export const useMedicalCases = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['cases'],
    queryFn: () => fetchCases(token!),
    enabled: !!token,
    select: (response) => response.data.cases,
  });
};