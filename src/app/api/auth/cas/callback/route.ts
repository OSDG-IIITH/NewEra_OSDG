// CAS Authentication callback route - Updated from forms-portal implementation
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

const CAS_BASE_URL = process.env.CAS_BASE_URL || 'https://login.iiit.ac.in/cas';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

interface CASResponse {
  serviceResponse: {
    authenticationSuccess?: {
      attributes: {
        uid: string[];
        Name: string[];
        'E-Mail': string[];
      };
    };
    authenticationFailure?: {
      code: string;
      description: string;
    };
  };
}

interface CASUser {
  username: string;
  name: string;
  email: string;
}

async function validateCASTicket(ticket: string, service: string): Promise<CASUser | null> {
  try {
    // Build validation URL with JSON format
    const validateUrl = `${CAS_BASE_URL}/serviceValidate?service=${encodeURIComponent(service)}&ticket=${encodeURIComponent(ticket)}&format=JSON`;
    
    const response = await fetch(validateUrl);
    const data: CASResponse = await response.json();
    
    console.log('CAS Response:', JSON.stringify(data, null, 2)); // For debugging
    
    // Check for authentication failure
    if (data.serviceResponse.authenticationFailure) {
      console.error('CAS Authentication failed:', data.serviceResponse.authenticationFailure);
      return null;
    }
    
    // Extract user attributes
    const attributes = data.serviceResponse.authenticationSuccess?.attributes;
    if (!attributes || !attributes.uid || !attributes.uid[0]) {
      console.error('No user ID in CAS response');
      return null;
    }
    
    return {
      username: attributes.uid[0],
      name: attributes.Name?.[0] || attributes.uid[0],
      email: attributes['E-Mail']?.[0] || `${attributes.uid[0]}@students.iiit.ac.in`,
    };
  } catch (error) {
    console.error('CAS validation error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticket = searchParams.get('ticket');
  const returnTo = searchParams.get('returnTo') || '/';
  
  if (!ticket) {
    return NextResponse.redirect(`${SITE_URL}/?error=no-ticket`);
  }
  
  // Build service URL matching what we sent to CAS login
  const serviceUrl = `${SITE_URL}/api/auth/cas/callback?returnTo=${encodeURIComponent(returnTo)}`;
  const user = await validateCASTicket(ticket, serviceUrl);
  
  if (!user) {
    return NextResponse.redirect(`${SITE_URL}/?error=validation-failed`);
  }
  
  try {
    // Create JWT token
    const token = await new SignJWT({ 
      username: user.username,
      name: user.name,
      email: user.email,
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
    
    // Set secure HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set('cas-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });
    
    return NextResponse.redirect(`${SITE_URL}${returnTo}`);
  } catch (error) {
    console.error('JWT signing error:', error);
    return NextResponse.redirect(`${SITE_URL}/?error=auth-failed`);
  }
}