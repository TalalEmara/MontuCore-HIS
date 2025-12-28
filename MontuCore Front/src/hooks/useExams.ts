import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type { Exam } from '../types/models';

export interface ExamsResponse {
  success: boolean;
  data: Exam[];
}

const fetchExams = async (token: string): Promise<ExamsResponse> => {
  const response = await fetch(`http://localhost:3000/api/exams?limit=50`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch exams');
  }
  return response.json();
};

export const useExams = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['exams'],
    queryFn: () => fetchExams(token!),
    enabled: !!token,
    select: (response) => response.data,
  });
};