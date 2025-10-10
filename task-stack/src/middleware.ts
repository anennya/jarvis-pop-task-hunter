import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'jarvis-auth';

function checkAuthFromRequest(request: NextRequest): boolean {
  const authCookie = request.cookies.get(AUTH_COOKIE);
  
  if (!authCookie) return false;
  
  try {
    const session = JSON.parse(authCookie.value);
    const now = Date.now();
    
    // Check if session is expired
    if (now > session.expires) return false;
    
    return session.authenticated === true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to login page and auth API
  if (pathname === '/login' || pathname === '/api/auth') {
    return NextResponse.next();
  }
  
  // Check authentication for all other routes
  const isAuthenticated = checkAuthFromRequest(request);
  
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};