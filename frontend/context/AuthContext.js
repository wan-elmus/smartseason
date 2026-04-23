'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { setAuthTokens, clearAuth, isAuthenticated } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const login = async (email, password) => {
    try {
      const response = await apiClient.post(ROUTES.LOGIN, { email, password });
      const { access_token, refresh_token } = response.data;
      
      setAuthTokens(access_token, refresh_token);
      
      // Fetch user info from /me endpoint
      const userResponse = await apiClient.get(ROUTES.ME);
      setUser(userResponse.data);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push('/login');
  }, [router]);

  const checkAuth = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return false;
    }

    try {
      const response = await apiClient.get(ROUTES.ME);
      setUser(response.data);
      setLoading(false);
      return true;
    } catch (error) {
      // Token expired or invalid
      clearAuth();
      setUser(null);
      setLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const performCheckAuth = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return false;
      }

      try {
        const response = await apiClient.get(ROUTES.ME);
        setUser(response.data);
        setLoading(false);
        return true;
      } catch (error) {
        clearAuth();
        setUser(null);
        setLoading(false);
        return false;
      }
    };

    performCheckAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}