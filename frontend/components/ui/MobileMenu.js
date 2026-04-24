'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function MobileMenu({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!isOpen) return null;

  const navItems = user?.role === 'admin' 
    ? [
        { name: 'Dashboard', href: '/dashboard/admin' },
        { name: 'Fields', href: '/fields' },
        { name: 'Profile', href: '/profile' },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard/agent' },
        { name: 'My Fields', href: '/fields' },
        { name: 'Profile', href: '/profile' },
      ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 sm:hidden"
        onClick={onClose}
      />
      
      {/* Menu panel */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 sm:hidden">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="font-semibold text-gray-800">SmartSeason</span>
            <button onClick={onClose} className="p-1 rounded-md text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`block px-4 py-2.5 text-sm ${
                  pathname === item.href
                    ? 'bg-primary/10 text-primary border-r-2 border-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">{user?.email}</div>
            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full text-left text-sm text-danger"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}