import { createContext, useContext, useState, type ReactNode } from 'react';

// --- Interfaces ---
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'ATHLETE' | 'CLINICIAN';
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  position?: string;
  jerseyNumber?: number;
  specialty?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  profile: UserProfile | null;
}

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  login: (token: string, user: User, profile: UserProfile | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // FIX: Use Lazy Initialization to read localStorage ONCE during initial render.
  // This prevents the "setState in useEffect" error.
  const [auth, setAuth] = useState<AuthState>(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedProfile = localStorage.getItem('profile');

    if (storedToken && storedUser) {
      try {
        return {
          token: storedToken,
          user: JSON.parse(storedUser),
          profile: storedProfile ? JSON.parse(storedProfile) : null,
        };
      } catch (e) {
        console.error("Failed to parse auth data from storage", e);
        // If parsing fails, clear storage to prevent stuck state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
      }
    }
    return { token: null, user: null, profile: null };
  });

  const login = (token: string, user: User, profile: UserProfile | null) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (profile) {
      localStorage.setItem('profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('profile');
    }
    setAuth({ token, user, profile });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    setAuth({ token: null, user: null, profile: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, isAuthenticated: !!auth.token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};