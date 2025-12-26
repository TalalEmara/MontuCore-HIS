import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth, type User, type UserProfile } from '../context/AuthContext';

// --- 1. Interfaces ---

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  result: {
    token: string;
    user: User;
    profile: UserProfile | null;
    success: boolean;
  };
}

// --- API Fetcher ---

const loginApi = async (
  data: LoginInput,
  API_URL: string = `http://localhost:3000/api`
): Promise<LoginResponse> => {
  
  const payload = {
    email: data.email,
    password: data.password,
  };

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to login');
  }

  return response.json();
};

// --- Custom Hook ---

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { login } = useAuth(); // Access the context login function

  return useMutation({
    mutationFn: (data: LoginInput) => loginApi(data),
    onSuccess: (data) => {
      // Sync with Context and LocalStorage immediately upon success
      if (data.result.success && data.result.token) {
        login(data.result.token, data.result.user, data.result.profile);
      }
      
      // Clear cache to ensure no stale data from previous users
      queryClient.clear(); 
    },
  });
};