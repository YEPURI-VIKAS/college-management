import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../lib/api';

export interface AppUser {
  id: string | number;
  email: string;
  user_metadata: {
    role: string;
    full_name: string;
  };
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('pvpsit_auth_user');
    const token = localStorage.getItem('pvpsit_auth_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to restore user session:", e);
        localStorage.removeItem('pvpsit_auth_user');
        localStorage.removeItem('pvpsit_auth_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<any>('/auth/login', { email, password });
    if (res.token && res.user) {
      const appUser: AppUser = {
        id: res.user.id,
        email: res.user.email,
        user_metadata: {
          role: res.user.role,
          full_name: res.user.fullName
        }
      };
      localStorage.setItem('pvpsit_auth_token', res.token);
      localStorage.setItem('pvpsit_auth_user', JSON.stringify(appUser));
      setUser(appUser);
    } else {
      throw new Error("Invalid response from server");
    }
  };

  const signup = async (email: string, password: string, fullName: string, role: string) => {
    const res = await api.post<any>('/auth/signup', { email, password, fullName, role });
    if (res.token && res.user) {
      const appUser: AppUser = {
        id: res.user.id,
        email: res.user.email,
        user_metadata: {
          role: res.user.role,
          full_name: res.user.fullName
        }
      };
      localStorage.setItem('pvpsit_auth_token', res.token);
      localStorage.setItem('pvpsit_auth_user', JSON.stringify(appUser));
      setUser(appUser);
    } else {
      throw new Error("Invalid response from server");
    }
  };

  const signOut = async () => {
    localStorage.removeItem('pvpsit_auth_token');
    localStorage.removeItem('pvpsit_auth_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
