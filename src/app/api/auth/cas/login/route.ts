// CAS Authentication API route for login
import { NextRequest, NextResponse } from 'next/server';

// Use login-test2 for localhost (IIIT WiFi), production CAS for deployed sites
const getCASBaseURL = (origin: string): string => {
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return 'https://login-test2.iiit.ac.in/cas'; // Test server - only works on IIIT WiFi
  }
  return 'https://login.iiit.ac.in/cas'; // Production server - accessible from anywhere (needs whitelisting)
};

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/';
  
  console.log('[CAS Login] === CAS LOGIN REQUEST ===');
  console.log('[CAS Login] Origin:', origin);
  console.log('[CAS Login] ReturnTo:', returnTo);
  
  // Normalize origin: remove www. prefix for CAS compatibility
  let normalizedOrigin = origin;
  if (normalizedOrigin.includes('www.')) {
    normalizedOrigin = normalizedOrigin.replace('://www.', '://');
  }
  console.log('[CAS Login] Normalized Origin:', normalizedOrigin);
  
  // Use the normalized domain (osdg.in or localhost) for callback
  const callbackUrl = `${normalizedOrigin}/api/auth/cas/callback?returnTo=${encodeURIComponent(returnTo)}`;
  
  console.log('[CAS Login] Using callback URL:', callbackUrl);
  
  // Get the appropriate CAS server based on origin
  const CAS_BASE_URL = getCASBaseURL(origin);
  console.log('[CAS Login] Using CAS server:', CAS_BASE_URL);
  
  // Build CAS login URL
  const casLoginUrl = `${CAS_BASE_URL}/login?service=${encodeURIComponent(callbackUrl)}`;
  
  console.log('[CAS Login] ✅ Redirecting to CAS:', casLoginUrl);
  
  return NextResponse.redirect(casLoginUrl);
}