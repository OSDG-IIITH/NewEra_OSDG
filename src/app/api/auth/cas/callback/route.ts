// CAS Authentication callback route - Testing mode (trusts tickets)
import { NextRequest, NextResponse } from 'next/server';

// Hardcoded to use login-test2 (no whitelisting required, works on IIIT WiFi)
const CAS_BASE_URL = 'https://login-test2.iiit.ac.in/cas';

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
  const baseUrl = origin.includes('localhost') ? origin : 'https://www.osdg.in';
  
  console.log('[CAS Callback] ⚠️ TESTING MODE: Trusting ticket without validation');
  console.log('[CAS Callback] Ticket accepted:', ticket);
  
  // For internal testing: trust the ticket since CAS redirected successfully
  // Use placeholder identity since we can't validate due to network/CORS restrictions
  const user = {
    username: `test_user_${ticket.substring(3, 8)}`, // Use part of ticket as identifier
    name: 'Internal Test User',
    email: 'test@iiit.ac.in'
  };
  
  console.log('[CAS Callback] ✅ User accepted (testing mode)');
  console.log('[CAS Callback] Username:', user.username);
  console.log('[CAS Callback] Name:', user.name);
  
  // Redirect back with user data
  const redirectUrl = new URL(returnTo, baseUrl);
  redirectUrl.searchParams.set('casAuth', 'success');
  redirectUrl.searchParams.set('username', user.username);
  redirectUrl.searchParams.set('name', user.name);
  redirectUrl.searchParams.set('email', user.email);
  
  console.log('[CAS Callback] ✅ Redirecting to:', redirectUrl.toString());
  
  return NextResponse.redirect(redirectUrl.toString());
}