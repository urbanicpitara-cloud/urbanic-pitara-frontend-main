import React, { createContext, useContext, useState, useEffect } from 'react';
import { authRepository } from '@/lib/api/repositories/auth';
import type { User, AuthContextType, RegisterData, UpdateProfileData } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const response = await authRepository.me();
        setUser(response);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authRepository.login(email, password);
      setUser(response.user);
      return response.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to login';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authRepository.signup(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.phone
      );
      setUser(response.user);
      return response.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authRepository.logout();
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to logout';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileData): Promise<User> => {
    if (data) {
      console.log("update profile data available")
    }
    setLoading(true);
    setError(null);
    try {
      // Disabled for now
      throw new Error('Profile update is not implemented yet');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
