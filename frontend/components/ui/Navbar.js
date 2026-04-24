'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Field Agent';
  const roleColor = user?.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-blue-100 text-blue-700';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-7 h-7">
                <Image
                  src="/logo.png"
                  alt="SmartSeason Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-semibold text-gray-800 text-base">SmartSeason</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-sm focus:outline-none"
              >
                <span className={`hidden sm:inline-block px-2 py-0.5 text-xs rounded-full ${roleColor}`}>
                  {roleLabel}
                </span>
                <span className="text-gray-700 text-sm hidden sm:inline">
                  {user?.full_name?.split(' ')[0]}
                </span>
                <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-800">{user?.full_name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-danger hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}