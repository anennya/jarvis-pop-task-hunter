import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const AUTH_COOKIE = 'jarvis-auth';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function checkAuth(): Promise<boolean> {
  const cookieStore = cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE);
  
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

export function createAuthSession(): string {
  const session = {
    authenticated: true,
    expires: Date.now() + SESSION_DURATION,
    created: Date.now()
  };
  
  return JSON.stringify(session);
}

export function validateCredentials(username: string, password: string): boolean {
  const correctUsername = process.env.AUTH_USERNAME || 'admin';
  const correctPassword = process.env.AUTH_PASSWORD || 'jarvis2024';
  
  return username === correctUsername && password === correctPassword;
}