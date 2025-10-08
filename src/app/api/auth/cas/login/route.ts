// CAS Authentication API route for login
import { NextRequest, NextResponse } from 'next/server';

const CAS_BASE_URL = process.env.CAS_BASE_URL || 'https://cas.iiit.ac.in/login';
const SITE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/';
  
  // Create the service URL that CAS will redirect back to after authentication
  const serviceUrl = `${SITE_URL}/api/auth/cas/callback`;
  
  // Build CAS login URL
  const casLoginUrl = `${CAS_BASE_URL}?service=${encodeURIComponent(serviceUrl)}&returnTo=${encodeURIComponent(returnTo)}`;
  
  return NextResponse.redirect(casLoginUrl);
}