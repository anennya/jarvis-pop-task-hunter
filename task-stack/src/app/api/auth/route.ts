import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createAuthSession } from '@/lib/auth';

const AUTH_COOKIE = 'jarvis-auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    const sessionData = createAuthSession();
    
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Set secure cookie
    response.cookies.set(AUTH_COOKIE, sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Logout - clear the cookie
  const response = NextResponse.json({ success: true });
  
  response.cookies.delete(AUTH_COOKIE);
  
  return response;
}