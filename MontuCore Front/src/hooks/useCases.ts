import { useQuery } from '@tanstack/react-query';

// --- 1. Define Types based on your JSON ---

export interface CaseAthlete {
  id: number;
  fullName: string;
  email: string;
}

export interface CaseClinician {
  id: number;
  fullName: string;
  email: string;
}

export interface Case {
  id: number;
  athleteId: number;
  managingClinicianId: number;
  appointmentId: number;
  diagnosisName: string;
  icd10Code: string;
  injuryDate: string;
  status: string; // e.g., "ACTIVE", "RECOVERED"
  severity: string; // e.g., "MODERATE", "MILD", "SEVERE"
  medicalGrade: string;
  athlete: CaseAthlete;
  managingClinician: CaseClinician;
}

export interface CasesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CasesResponse {
  success: boolean;
  data: {
    cases: Case[];
    pagination: CasesPagination;
  };
}

export interface CaseFilters {
  page?: number;
  limit?: number;
  status?: string;
  athleteId?: number;
}

const fetchCases = async (filters: CaseFilters = {}): Promise<CasesResponse> => {
  const token = localStorage.getItem('token');
  
  // Build query string from filters
  const queryParams = new URLSearchParams();
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.athleteId) queryParams.append('athleteId', filters.athleteId.toString());

  const url = `http://localhost:3000/api/cases?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch cases');
  }

  return response.json();
};


export const useCases = (filters?: CaseFilters) => {
  return useQuery({
    queryKey: ['cases', filters], 
    queryFn: () => fetchCases(filters),
    
    // If you need pagination later, remove this select or change it to return { cases, pagination }
    select: (response) => response.data.cases, 
  });
};