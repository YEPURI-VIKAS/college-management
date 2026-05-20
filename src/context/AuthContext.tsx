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
    try {
      // Try Spring Boot backend first (works locally)
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
        return;
      }
    } catch (_) {
      // Backend unavailable — fall back to Supabase (works online)
    }

    // Supabase fallback for hosted/demo environment
    const { supabase } = await import('../lib/supabase');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (data.user && data.session) {
      const appUser: AppUser = {
        id: data.user.id,
        email: data.user.email ?? email,
        user_metadata: {
          role: data.user.user_metadata?.role ?? 'Student',
          full_name: data.user.user_metadata?.full_name ?? email.split('@')[0]
        }
      };
      localStorage.setItem('pvpsit_auth_token', data.session.access_token);
      localStorage.setItem('pvpsit_auth_user', JSON.stringify(appUser));
      setUser(appUser);
    }
  };

  const signup = async (email: string, password: string, fullName: string, role: string) => {
    try {
      // Try Spring Boot backend first (works locally)
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
        return;
      }
    } catch (_) {
      // Backend unavailable — fall back to Supabase (works online)
    }

    // Supabase fallback for hosted/demo environment
    const { supabase } = await import('../lib/supabase');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } }
    });
    if (error) throw new Error(error.message);
    if (data.user && data.session) {
      const appUser: AppUser = {
        id: data.user.id,
        email: data.user.email ?? email,
        user_metadata: { role, full_name: fullName }
      };
      localStorage.setItem('pvpsit_auth_token', data.session.access_token);
      localStorage.setItem('pvpsit_auth_user', JSON.stringify(appUser));
      setUser(appUser);
    } else if (data.user && !data.session) {
      throw new Error('Please check your email to confirm your account, or contact admin.');
    }
  };

  const signOut = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase.auth.signOut();
    } catch (_) { /* ignore */ }
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
