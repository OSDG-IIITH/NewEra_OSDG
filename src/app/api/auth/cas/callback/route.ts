// CAS Authentication callback route - Bridge for production
import { NextRequest, NextResponse } from 'next/server';

// Hardcoded to use login-test2 (no whitelisting required, works on IIIT WiFi)
const CAS_BASE_URL = 'https://login-test2.iiit.ac.in/cas';

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
    
    console.log('[CAS Validate] === TICKET VALIDATION ===');
    console.log('[CAS Validate] Service URL:', service);
    console.log('[CAS Validate] Ticket:', ticket);
    console.log('[CAS Validate] Validation URL:', validateUrl);
    
    const response = await fetch(validateUrl);
    console.log('[CAS Validate] Response status:', response.status);
    
    const data: CASResponse = await response.json();
    console.log('[CAS Validate] Full CAS Response:', JSON.stringify(data, null, 2));
    
    // Check for authentication failure
    if (data.serviceResponse.authenticationFailure) {
      console.error('[CAS Validate] ❌ Authentication failed:', data.serviceResponse.authenticationFailure);
      return null;
    }
    
    // Extract user attributes
    const attributes = data.serviceResponse.authenticationSuccess?.attributes;
    if (!attributes || !attributes.uid || !attributes.uid[0]) {
      console.error('[CAS Validate] ❌ No user ID in CAS response');
      return null;
    }
    
    console.log('[CAS Validate] ✅ Validation successful! User:', attributes.uid[0]);
    
    return {
      username: attributes.uid[0],
      name: attributes.Name?.[0] || attributes.uid[0],
      email: attributes['E-Mail']?.[0] || `${attributes.uid[0]}@students.iiit.ac.in`,
    };
  } catch (error) {
    console.error('[CAS Validate] ❌ Exception during validation:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const ticket = searchParams.get('ticket');
  const returnTo = searchParams.get('returnTo') || '/';
  
  console.log('[CAS Callback] === CALLBACK RECEIVED ===');
  console.log('[CAS Callback] Full URL:', request.url);
  console.log('[CAS Callback] Origin:', origin);
  console.log('[CAS Callback] Ticket:', ticket ? `Present (${ticket.substring(0, 30)}...)` : 'Missing');
  console.log('[CAS Callback] ReturnTo:', returnTo);
  
  if (!ticket) {
    console.error('[CAS Callback] ❌ No ticket provided');
    return NextResponse.redirect(`${origin}/?error=no-ticket`);
  }
  
  // Hardcode production URL to www.osdg.in, use origin for localhost
  // This MUST match exactly what was sent to CAS during login
  const baseUrl = origin.includes('localhost') ? origin : 'https://www.osdg.in';
  const serviceUrl = `${baseUrl}/api/auth/cas/callback?returnTo=${encodeURIComponent(returnTo)}`;
  console.log('[CAS Callback] Validating with service URL:', serviceUrl);
  
  const user = await validateCASTicket(ticket, serviceUrl);
  
  if (!user) {
    console.error('[CAS Callback] ❌ User validation failed');
    return NextResponse.redirect(`${baseUrl}/?error=validation-failed`);
  }
  
  console.log('[CAS Callback] ✅✅✅ SUCCESS! User authenticated ✅✅✅');
  console.log('[CAS Callback] Username:', user.username);
  console.log('[CAS Callback] Name:', user.name);
  console.log('[CAS Callback] Email:', user.email);
  
  // Redirect back with user data - use same baseUrl for consistency
  const redirectUrl = new URL(returnTo, baseUrl);
  redirectUrl.searchParams.set('casAuth', 'success');
  redirectUrl.searchParams.set('username', user.username);
  redirectUrl.searchParams.set('name', user.name);
  redirectUrl.searchParams.set('email', user.email);
  
  console.log('[CAS Callback] ✅ Redirecting to:', redirectUrl.toString());
  
  return NextResponse.redirect(redirectUrl.toString());
}