'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { setAuthTokens, clearAuth, isAuthenticated } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isMounted = useRef(true);
  const authInitialized = useRef(false);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post(ROUTES.LOGIN, { email, password });
      const { access_token, refresh_token } = response.data;

      setAuthTokens(access_token, refresh_token);

      const userResponse = await apiClient.get(ROUTES.ME);
      if (isMounted.current) {
        setUser(userResponse.data);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push('/login');
  }, [router]);

  const checkAuth = useCallback(async () => {
    if (!isAuthenticated()) {
      if (isMounted.current) {
        setLoading(false);
      }
      return false;
    }

    try {
      const response = await apiClient.get(ROUTES.ME);
      if (isMounted.current) {
        setUser(response.data);
        setLoading(false);
      }
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        clearAuth();
      }
      if (isMounted.current) {
        setUser(null);
        setLoading(false);
      }
      return false;
    }
  }, []);

  useEffect(() => {
    if (!authInitialized.current) {
      authInitialized.current = true;
      checkAuth();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}