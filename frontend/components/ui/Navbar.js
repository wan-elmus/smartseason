'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Leaf,
  User,
  Menu,
  LogOut,
  Settings,
} from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems =
    user?.role === 'admin'
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
    <nav className="bg-primary shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative w-7 h-7 transition-transform group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="SmartSeason Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-semibold text-white text-lg tracking-tight">SmartSeason</span>
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:gap-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-x-2 px-5 py-2 text-base font-semibold rounded-3xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-inner'
                      : 'text-white hover:bg-gray-800/40 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-x-4">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="flex items-center gap-x-3 text-sm focus:outline-none group"
              >
                <span className="text-white/90 text-sm hidden sm:inline group-hover:text-white transition-colors">
                  {user?.full_name?.split(' ')[0]}
                </span>
                <div className="w-8 h-8 bg-white/20 text-white rounded-2xl flex items-center justify-center text-base font-semibold group-hover:bg-white/30 transition-colors">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-base font-semibold text-gray-900">{user?.full_name}</p>
                    <p className="text-xs font-medium text-emerald-600 mt-1">
                      {user?.role === 'admin' ? 'Administrator' : 'Field Agent'}
                    </p>
                    <p className="text-sm text-gray-500 mt-3">{user?.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-x-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Profile Settings
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-x-3 text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu */}
            <button
              onClick={onMenuClick}
              className="sm:hidden p-2 rounded-2xl text-white hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}