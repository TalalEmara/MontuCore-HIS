import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

// ... (Interfaces omitted) ...
export interface CaseRecordResult { caseRecord: any; message: string; }

const fetchCaseRecord = async (
  caseId: number,
  token: string,
  API_URL: string = `http://localhost:3000/api`
): Promise<any> => {
  const response = await fetch(`${API_URL}/cases/${caseId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch case record');
  }
  return response.json();
};

export const useCaseRecord = (caseId: number) => {
  const { token } = useAuth();

  const queryInfo = useQuery({
    queryKey: ['caseRecord', caseId],
    queryFn: () => fetchCaseRecord(caseId, token!),
    enabled: !!caseId && !!token,
    placeholderData: keepPreviousData, 
    select: (response): CaseRecordResult => ({
      caseRecord: response.data,
      message: response.message || 'Case record loaded successfully',
    }),
  });

  return {
    ...queryInfo,
    caseRecord: queryInfo.data?.caseRecord,
    message: queryInfo.data?.message,
  };
};