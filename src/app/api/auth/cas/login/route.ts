// CAS Authentication API route for login
import { NextRequest, NextResponse } from 'next/server';

const CAS_BASE_URL = process.env.CAS_BASE_URL || 'https://login.iiit.ac.in/cas';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/';
  
  console.log('[CAS Login] === CAS LOGIN REQUEST ===');
  console.log('[CAS Login] Origin:', origin);
  console.log('[CAS Login] ReturnTo:', returnTo);
  
  // Use osdg.in callback URL so CAS redirects back to osdg.in
  const callbackUrl = `${origin}/api/auth/cas/callback?returnTo=${encodeURIComponent(returnTo)}`;
  
  console.log('[CAS Login] Using osdg.in callback URL:', callbackUrl);
  
  // Build CAS login URL
  const casLoginUrl = `${CAS_BASE_URL}/login?service=${encodeURIComponent(callbackUrl)}`;
  
  console.log('[CAS Login] ✅ Redirecting to CAS:', casLoginUrl);
  
  return NextResponse.redirect(casLoginUrl);
}