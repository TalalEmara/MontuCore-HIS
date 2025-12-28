import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../src/context/AuthContext';
import type { Exam } from '../../src/types/models';

const API_URL = 'http://localhost:3000/api';

export const usePatientExams = (patientId: number | string | null | undefined) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['patient-exams', patientId],
    queryFn: async (): Promise<Exam[]> => {
      if (!patientId) return [];

      const response = await fetch(`${API_URL}/exams?athleteId=${patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patient exams');
      }

      const json = await response.json();
      // Assuming API returns { success: true, data: Exam[] }
      return json.data || [];
    },
    // Only run if we have a token and a valid patientId
    enabled: !!token && !!patientId && patientId !== '--',
  });
};