'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="mr-2 p-2 rounded-md text-gray-600 hover:bg-gray-100 md:hidden"
            >
              ☰
            </button>
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#8B2E3C] to-[#A84D61] rounded-lg flex items-center justify-center text-lg font-bold text-white">
                💰
              </div>
              <span className="font-bold text-[#8B2E3C]">Family</span>
            </Link>
          </div>

          {/* Right: User Info */}
          <div className="ml-auto flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-[#8B2E3C]">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">Sesión Activa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
