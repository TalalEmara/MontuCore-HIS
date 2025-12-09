import { useMutation } from '@tanstack/react-query';

// --- Shared Types & API Call ---

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

// The core fetch function used by both hooks
const loginApi = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
};

// (Returns Full Response)
// =========================================================
export const useLogin = () => {
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      // You get the full response object here
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('Login Raw Success:', response.message);
    },
    onError: (error) => {
      console.error('Login Raw Error:', error);
    },
  });
};

// "Extension" Hook (Returns User Object Only)
// =========================================================
export const useGetUser = () => {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
  
      const response = await loginApi(credentials);
      
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // 4. Return ONLY the user
      return user; 
    },
    onSuccess: (user) => {
      // 'user' is directly the User object here
      console.log('Login User-Only Success:', user.fullName);
    },
    onError: (error) => {
      console.error('Login User-Only Error:', error);
    },
  });
};