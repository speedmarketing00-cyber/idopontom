import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check for Supabase auth cookie (sb-*-auth-token)
  const cookies = request.cookies.getAll();
  const hasAuthCookie = cookies.some(c => c.name.includes('-auth-token'));

  // Logged in user on homepage → dashboard
  if (hasAuthCookie && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Logged in user on login/register → dashboard
  if (hasAuthCookie && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // NOT logged in user on dashboard → login
  if (!hasAuthCookie && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/auth/login', '/auth/register', '/dashboard/:path*'],
};
