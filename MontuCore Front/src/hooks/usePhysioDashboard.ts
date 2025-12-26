import { useQuery, keepPreviousData } from '@tanstack/react-query';

// --- 1. Interfaces ---

export interface PhysioUserStub {
  id: number;
  fullName: string;
  email: string;
}

export interface medicalCase {
  id: number;
  diagnosisName: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  status: string;
  injuryDate: string;
  athlete: PhysioUserStub;
  managingClinician: PhysioUserStub;
}

// Inferred from context, as the example array was empty. 
// Assuming it follows the general Appointment structure.
export interface PhysioAppointment {
  id: number;
  scheduledAt: string;
  status: string;
  athlete: PhysioUserStub;
}

// The inner data object based on your JSON
export interface PhysioDashboardData {
  activeCases: medicalCase[];
  todaysAppointments: PhysioAppointment[];
}

// The raw API response
export interface PhysioDashboardResponse {
  success: boolean;
  data: PhysioDashboardData;
}

// --- 2. API Fetcher ---

const fetchPhysiotherapistDashboard = async (
  physioId: number,
  API_URL: string = `http://localhost:3000/api`
): Promise<PhysioDashboardResponse> => {
  // const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/physio-therapist/dashboard/${physioId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch physiotherapist dashboard');
  }

  return response.json();
};

// --- 3. Custom Hook ---

export const usePhysiotherapistDashboard = (physioId: number) => {
  return useQuery({
    queryKey: ['dashboard', 'physiotherapist', physioId],
    queryFn: () => fetchPhysiotherapistDashboard(physioId),
    enabled: !!physioId,
    placeholderData: keepPreviousData, // Keeps data visible while refetching
  });
};