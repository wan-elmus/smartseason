'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/forms/LoginForm';
import Card from '@/components/ui/Card';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🌱</div>
          <h1 className="text-xl font-semibold text-gray-800">SmartSeason</h1>
          <p className="text-xs text-gray-500 mt-1">Field Monitoring System</p>
        </div>
        
        <Card title="Sign in to your account">
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}