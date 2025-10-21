// CAS Authentication API route for login
import { NextRequest, NextResponse } from 'next/server';

const CAS_BASE_URL = process.env.CAS_BASE_URL || 'https://login.iiit.ac.in/cas';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/';
  
  // Always use localhost for CAS callback since production domain isn't whitelisted yet
  // After authentication, the callback will redirect to the production domain (osdg.in)
  const serviceUrl = `http://localhost:3000/api/auth/cas/callback?returnTo=${encodeURIComponent(returnTo)}`;
  
  // Build CAS login URL following IIIT CAS format
  const casLoginUrl = `${CAS_BASE_URL}/login?service=${encodeURIComponent(serviceUrl)}`;
  
  return NextResponse.redirect(casLoginUrl);
}