'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/Navbar';
import MobileMenu from '@/components/ui/MobileMenu';
import { usePathname, useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';

export default function LayoutClient({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === '/login';
  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.push('/login');
    }
  }, [loading, user, isAuthPage, router]);

  if (loading && !isAuthPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }
  if (isLoginPage || !user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}