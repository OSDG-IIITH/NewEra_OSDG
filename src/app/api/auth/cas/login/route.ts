// CAS Authentication API route for login
import { NextRequest, NextResponse } from 'next/server';

const CAS_BASE_URL = process.env.CAS_BASE_URL || 'https://login.iiit.ac.in/cas';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/';
  
  console.log('[CAS Login] === CAS LOGIN REQUEST ===');
  console.log('[CAS Login] ReturnTo:', returnTo);
  
  // Use osdg.iiit.ac.in which IS whitelisted by IT office
  const serviceUrl = `https://osdg.iiit.ac.in/forms/api/auth/login/callback?returnTo=${encodeURIComponent(returnTo)}`;
  
  console.log('[CAS Login] Using whitelisted service URL:', serviceUrl);
  
  // Build CAS login URL
  const casLoginUrl = `${CAS_BASE_URL}/login?service=${encodeURIComponent(serviceUrl)}`;
  
  console.log('[CAS Login] ✅ Redirecting to CAS:', casLoginUrl);
  
  // Redirect the entire page to CAS (no popup)
  return NextResponse.redirect(casLoginUrl);
}