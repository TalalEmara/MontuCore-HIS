import { useMutation, useQueryClient } from '@tanstack/react-query';

// --- 1. Interfaces ---

export interface RegisterResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: number;
    email: string;
    fullName: string;
    role: string;
  };
}

export interface BaseRegisterData {
  email: string;
  password: string;
  fullName: string;
  gender: 'Male' | 'Female';
  dob: string; // ISO Date String
}

export interface ClinicianRegisterInput extends BaseRegisterData {
  specialty: string;
}

export interface AthleteRegisterInput extends BaseRegisterData {
  position: string;
  jerseyNumber: number;
}

// --- 2. API Fetchers ---

const registerClinicianApi = async (
  data: ClinicianRegisterInput,
  API_URL: string = `http://localhost:3000/api`
): Promise<RegisterResponse> => {
    // const token = localStorage.getItem('token');
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBzcG9ydHNoaXMuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2NzA1NzcxLCJleHAiOjE3NjY5NjQ5NzF9.zd5VLqnZS0oKnS5y6YpAGniB8PEk7rAzvT3ATUP3crQ";
 
    
  const payload = {
    generalData: {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: 'CLINICIAN',
      gender: data.gender,
      dob: data.dob,
    },
    userData: {
      specialty: data.specialty,
    },
  };

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to register clinician');
  }

  return response.json();
};

const registerAthleteApi = async (
  data: AthleteRegisterInput,
  API_URL: string = `http://localhost:3000/api`
): Promise<RegisterResponse> => {
  const token = localStorage.getItem('token');

  const payload = {
    generalData: {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: 'ATHLETE',
      gender: data.gender,
      dob: data.dob,
    },
    userData: {
      position: data.position,
      jerseyNumber: data.jerseyNumber,
    },
  };

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to register athlete');
  }

  return response.json();
};

// --- 3. Custom Hooks ---

export const useClinicianReg = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClinicianRegisterInput) => registerClinicianApi(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['clinicians'] });
    },
  });
};

export const useAthleteReg = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AthleteRegisterInput) => registerAthleteApi(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
};