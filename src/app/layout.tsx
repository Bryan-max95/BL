import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import AppLayout from './AppLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FamilyFinance - Gestión Financiera Familiar',
  description: 'Plataforma de gestión financiera para parejas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
