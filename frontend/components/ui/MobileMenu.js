'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { X, LayoutDashboard, Leaf, User, LogOut } from 'lucide-react';

export default function MobileMenu({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = user?.role === 'admin'
    ? [
        { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Fields', href: '/fields', icon: Leaf },
        { name: 'Profile', href: '/profile', icon: User },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard/agent', icon: LayoutDashboard },
        { name: 'My Fields', href: '/fields', icon: Leaf },
        { name: 'Profile', href: '/profile', icon: User },
      ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/40 z-40 sm:hidden
          transition-opacity duration-300
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
          fixed top-0 left-0 bottom-0 w-[85%] max-w-xs bg-gray-900 z-50 sm:hidden
          flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-white">SmartSeason</span>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-300 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-semibold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {user?.full_name}
              </p>
              <p className="text-xs text-gray-300">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors
                  ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-300 hover:bg-gray-100'
                  }
                `}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-primary' : 'text-gray-300'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}