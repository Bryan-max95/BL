import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/login') {
    if (token && verifyToken(token)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token || !verifyToken(token)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/personal/:path*',
    '/joint/:path*',
    '/wedding/:path*',
    '/reports/:path*',
    '/profile/:path*',
    '/history/:path*',
    '/settings/:path*',
  ],
};
