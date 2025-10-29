// CAS Authentication API route for login
import { NextRequest, NextResponse } from 'next/server';

// Hardcoded to use login-test2 (no whitelisting required, works on IIIT WiFi)
const CAS_BASE_URL = 'https://login-test2.iiit.ac.in/cas';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/';
  
  console.log('[CAS Login] === CAS LOGIN REQUEST ===');
  console.log('[CAS Login] Origin:', origin);
  console.log('[CAS Login] ReturnTo:', returnTo);
  
  // Hardcode production URL to www.osdg.in, use origin for localhost
  const baseUrl = origin.includes('localhost') ? origin : 'https://www.osdg.in';
  const callbackUrl = `${baseUrl}/api/auth/cas/callback?returnTo=${encodeURIComponent(returnTo)}`;
  
  console.log('[CAS Login] Using callback URL:', callbackUrl);
  
  // Build CAS login URL with login-test2
  const casLoginUrl = `${CAS_BASE_URL}/login?service=${encodeURIComponent(callbackUrl)}`;
  
  console.log('[CAS Login] ✅ Redirecting to CAS:', casLoginUrl);
  
  return NextResponse.redirect(casLoginUrl);
}