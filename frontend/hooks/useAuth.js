'use client';

import { useAuth } from '@/context/AuthContext';

export function useAuthHook() {
  const { user, login, logout, loading, checkAuth } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';
  
  return {
    user,
    isAdmin,
    isAgent,
    login,
    logout,
    isLoading: loading,
    checkAuth,
  };
}