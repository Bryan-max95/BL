import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export function authMiddleware(request: NextRequest) {
  const token = getTokenFromRequest(request);

  // Protected routes
  const protectedRoutes = [
    '/dashboard',
    '/personal',
    '/joint',
    '/wedding',
    '/reports',
    '/profile',
    '/history',
    '/settings',
    '/api/incomes',
    '/api/expenses',
    '/api/wedding',
    '/api/reports',
    '/api/audit',
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}
