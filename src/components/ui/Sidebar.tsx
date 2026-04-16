'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const MENU_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '' },
  { href: '/savings', label: 'Ahorros', icon: '' },
  { href: '/personal', label: 'Finanzas Personales', icon: '' },
  { href: '/joint', label: 'Finanzas Conjuntas', icon: '' },
  { href: '/wedding', label: 'Boda', icon: '' },
  { href: '/reports', label: 'Reportes', icon: '' },
  { href: '/history', label: 'Historial', icon: '' },
  { href: '/profile', label: 'Perfil', icon: '' },
  { href: '/settings', label: 'Configuración', icon: '' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle - Hamburguesa */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed md:hidden bottom-6 right-6 z-50 w-14 h-14 bg-[#8B2E3C] text-white rounded-full shadow-2xl hover:bg-[#6B2430] transition-all flex items-center justify-center text-2xl"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay - Mobiles */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 transform md:transform-none transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-72 bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d] text-white flex flex-col shadow-2xl`}
      >
        {/* Header Logo */}
        <div className="p-8 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8B2E3C] to-[#A84D61] rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg">
              
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B2E3C] to-[#A84D61] bg-clip-text text-transparent">
                Family
              </h1>
              <p className="text-xs text-gray-400">Finance Manager</p>
            </div>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto scrollbar-hide">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-5 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#8B2E3C] to-[#A84D61] text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`text-xl transition-transform group-hover:scale-110 ${isActive ? '' : 'group-hover:scale-125'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {isActive && <span className="ml-auto">→</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="px-4 py-6 border-t border-white/10 space-y-3 bg-gradient-to-t from-black/30 to-transparent">
          <div className="px-5 py-3 bg-white/5 rounded-lg backdrop-blur">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Sesión</p>
            <p className="text-sm font-semibold text-white truncate mt-1">{user?.username}</p>
          </div>
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
             Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
