'use client';

import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/Navbar';
import { usePathname } from 'next/navigation';

export default function LayoutClient({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  const isLoginPage = pathname === '/login';
  
  if (loading && !isLoginPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}