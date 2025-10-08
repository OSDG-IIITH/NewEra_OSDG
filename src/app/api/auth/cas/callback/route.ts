// CAS Authentication callback route
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

const CAS_BASE_URL = process.env.CAS_BASE_URL || 'https://cas.iiit.ac.in';
const SITE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

interface CASUser {
  username: string;
  name: string;
  email: string;
  rollno?: string;
}

async function validateCASTicket(ticket: string, service: string): Promise<CASUser | null> {
  try {
    const validateUrl = `${CAS_BASE_URL}/serviceValidate?ticket=${ticket}&service=${encodeURIComponent(service)}`;
    const response = await fetch(validateUrl);
    const xmlText = await response.text();
    
    console.log('CAS Response:', xmlText); // For debugging
    
    // Parse CAS XML response
    if (xmlText.includes('<cas:authenticationSuccess>')) {
      const usernameMatch = xmlText.match(/<cas:user>([^<]+)<\/cas:user>/);
      
      // IIIT CAS may return attributes differently
      const nameMatch = xmlText.match(/<cas:name>([^<]+)<\/cas:name>/) || 
                       xmlText.match(/<cas:attributes>[\s\S]*?<cas:name>([^<]+)<\/cas:name>/);
      const emailMatch = xmlText.match(/<cas:e-mail>([^<]+)<\/cas:e-mail>/) ||
                        xmlText.match(/<cas:email>([^<]+)<\/cas:email>/) ||
                        xmlText.match(/<cas:attributes>[\s\S]*?<cas:e-mail>([^<]+)<\/cas:e-mail>/);
      const rollnoMatch = xmlText.match(/<cas:rollno>([^<]+)<\/cas:rollno>/) ||
                         xmlText.match(/<cas:attributes>[\s\S]*?<cas:rollno>([^<]+)<\/cas:rollno>/);
      
      if (usernameMatch) {
        return {
          username: usernameMatch[1],
          name: nameMatch?.[1] || usernameMatch[1],
          email: emailMatch?.[1] || `${usernameMatch[1]}@students.iiit.ac.in`,
          rollno: rollnoMatch?.[1]
        };
      }
    }
    
    console.error('CAS Authentication failed:', xmlText);
    return null;
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
    return NextResponse.redirect(`${SITE_URL}/login?error=no-ticket`);
  }
  
  const serviceUrl = `${SITE_URL}/api/auth/cas/callback`;
  const user = await validateCASTicket(ticket, serviceUrl);
  
  if (!user) {
    return NextResponse.redirect(`${SITE_URL}/login?error=validation-failed`);
  }
  
  try {
    // Create JWT token
    const token = await new SignJWT({ 
      username: user.username,
      name: user.name,
      email: user.email,
      rollno: user.rollno
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
    return NextResponse.redirect(`${SITE_URL}/login?error=auth-failed`);
  }
}