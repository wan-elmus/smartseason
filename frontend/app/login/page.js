'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/forms/LoginForm';
import Spinner from '@/components/ui/Spinner';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/agent');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        {/* <Spinner size="lg" /> */}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-primary to-primary-dark rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">SmartSeason</h1>
          <p className="text-lg text-gray-500 mt-1">Field Monitoring System</p>
        </div>
        
        {/* Login Card with Distinct Shadow */}
        <div className="bg-white rounded-xl shadow-xl shadow-gray-300/50 border border-gray-100 overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <p className="text-center text-sm text-gray-500 mt-0.5">Sign in to continue to your dashboard</p>
          </div>
          <div className="p-6 pt-4">
            <LoginForm />
          </div>
        </div>
        
        {/* Help text */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Need help? Contact your system administrator
        </p>
      </div>
    </div>
  );
}