import { useQuery } from '@tanstack/react-query';

// --- 1. Interfaces ---

import type { User } from '../types/models';

// Response for getAllUsers
export interface UsersResponse {
  users: User[];
}

// Response for getUserById
export interface UserResponse {
  user: User;
}

// Specific Interfaces for Role-based endpoints
export interface ClinicianProfile {
  id: number;
  userId: number;
  specialty: string;
}

export interface Clinician extends User {
  clinicianProfile?: ClinicianProfile;
}

export interface CliniciansResponse {
  clinicians: Clinician[];
}

export interface AthleteProfile {
  id: number;
  userId: number;
  position: string;
  jerseyNumber: number;
}

export interface Athlete extends User {
  athleteProfile?: AthleteProfile;
}

export interface AthletesResponse {
  athletes: Athlete[];
}

// --- 2. API Fetchers ---

const fetchAllUsers = async (
  API_URL: string = `http://localhost:3000/api`
): Promise<UsersResponse> => {
  const token = localStorage.getItem('token');
  // const token = "YOUR_HARDCODED_TOKEN_HERE"; // Use localStorage in production

  const response = await fetch(`${API_URL}/auth/getAllUsers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch users');
  }

  return response.json();
};

const fetchUserById = async (
  userId: number,
  API_URL: string = `http://localhost:3000/api`
): Promise<UserResponse> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/auth/getUserById/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user details');
  }

  return response.json();
};

const fetchAllClinicians = async (
  API_URL: string = `http://localhost:3000/api`
): Promise<CliniciansResponse> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/auth/getAllClinicians`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch clinicians');
  }

  return response.json();
};

const fetchAllAthletes = async (
  API_URL: string = `http://localhost:3000/api`
): Promise<AthletesResponse> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/auth/getAllAthletes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch athletes');
  }

  return response.json();
};

// --- 3. Custom Hooks ---

// Hook to get ALL users
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchAllUsers(),
    select: (response) => response.users,
  });
};

// Hook to get users filtered by ROLE (Client-side filtering from getAllUsers)
export const useUsersByRole = (role: 'ATHLETE' | 'CLINICIAN' | 'ADMIN') => {
  return useQuery({
    queryKey: ['users', role],
    queryFn: () => fetchAllUsers(),
    select: (response) => response.users.filter((user) => user.role === role),
  });
};

// Hook to get a specific user by ID
export const useUserById = (userId: number) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId, // Only fetch if userId is valid
    select: (response) => response.user,
  });
};

// Hook to get ALL Clinicians (Dedicated Endpoint)
export const useAllClinicians = () => {
  return useQuery({
    queryKey: ['clinicians'],
    queryFn: () => fetchAllClinicians(),
    select: (response) => response.clinicians,
  });
};

// Hook to get ALL Athletes (Dedicated Endpoint)
export const useAllAthletes = () => {
  return useQuery({
    queryKey: ['athletes'],
    queryFn: () => fetchAllAthletes(),
    select: (response) => response.athletes,
  });
};