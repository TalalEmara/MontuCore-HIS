import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../src/context/AuthContext';
import type { Exam } from '../../src/types/models';

const API_URL = 'http://localhost:3000/api';

export const usePatientExams = (patientId: number | string | null | undefined, caseId?: number | string | null) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['patient-exams', patientId, caseId || 'all'],
    queryFn: async (): Promise<Exam[]> => {
      if (!patientId) return [];

      const queryParams = new URLSearchParams({
        athleteId: patientId.toString(),
        limit: '1000'
      });

      if (caseId) {
        queryParams.append('caseId', caseId.toString());
      }

      const response = await fetch(`${API_URL}/exams?${queryParams}`, {
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