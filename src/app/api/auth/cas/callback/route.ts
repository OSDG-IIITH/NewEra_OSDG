// CAS Authentication callback route - Bridge for production
import { NextRequest, NextResponse } from 'next/server';

const CAS_BASE_URL = process.env.CAS_BASE_URL || 'https://login.iiit.ac.in/cas';

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
  
  console.log('[CAS Callback] === CALLBACK RECEIVED ===');
  console.log('[CAS Callback] Full URL:', request.url);
  console.log('[CAS Callback] Ticket:', ticket ? `Present (${ticket.substring(0, 30)}...)` : 'Missing');
  console.log('[CAS Callback] ReturnTo:', returnTo);
  
  if (!ticket) {
    console.error('[CAS Callback] ❌ No ticket provided');
    // Redirect back to osdg.in with error
    return NextResponse.redirect(`https://osdg.in/?error=no-ticket`);
  }
  
  // Validate using the whitelisted osdg.iiit.ac.in service URL
  const serviceUrl = `https://osdg.iiit.ac.in/forms/api/auth/login/callback?returnTo=${encodeURIComponent(returnTo)}`;
  console.log('[CAS Callback] Validating with service URL:', serviceUrl);
  
  const user = await validateCASTicket(ticket, serviceUrl);
  
  if (!user) {
    console.error('[CAS Callback] ❌ User validation failed');
    // Redirect back to osdg.in with error
    return NextResponse.redirect(`https://osdg.in/?error=validation-failed`);
  }
  
  console.log('[CAS Callback] ✅✅✅ SUCCESS! User authenticated ✅✅✅');
  console.log('[CAS Callback] Username:', user.username);
  console.log('[CAS Callback] Name:', user.name);
  console.log('[CAS Callback] Email:', user.email);
  
  // Redirect back to osdg.in with user data in URL params
  const redirectUrl = new URL(returnTo, 'https://osdg.in');
  redirectUrl.searchParams.set('casAuth', 'success');
  redirectUrl.searchParams.set('username', user.username);
  redirectUrl.searchParams.set('name', user.name);
  redirectUrl.searchParams.set('email', user.email);
  
  console.log('[CAS Callback] ✅ Redirecting to:', redirectUrl.toString());
  
  return NextResponse.redirect(redirectUrl.toString());
}