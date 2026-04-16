'use client';

import Sidebar from '@/components/ui/Sidebar';
import Navbar from '@/components/ui/Navbar';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  
  // Las páginas que no deben mostrar sidebar (login, etc)
  const noSidebarPages = ['/login', '/register', '/'];

  const showSidebar = user && !noSidebarPages.includes(pathname);

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col">
        {showSidebar && <Navbar />}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
