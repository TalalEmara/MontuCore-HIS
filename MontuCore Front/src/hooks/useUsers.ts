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

// --- 2. API Fetchers ---

const fetchAllUsers = async (
  API_URL: string = `http://localhost:3000/api`
): Promise<UsersResponse> => {
//   const token = localStorage.getItem('token');
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBzcG9ydHNoaXMuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2NzA5Nzg5LCJleHAiOjE3NjY5Njg5ODl9.vO0XcSuxXgM_zHfyugWB0FyScF9xh_A4fhbu44ejl_E";

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

// --- 3. Custom Hooks ---

// Hook to get ALL users
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchAllUsers(),
    select: (response) => response.users,
  });
};

// Hook to get users filtered by ROLE (e.g., 'ATHLETE' or 'CLINICIAN')
// Note: Backend returns all users, so we filter on the client side
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