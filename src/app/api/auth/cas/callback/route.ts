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
  const { searchParams, origin } = new URL(request.url);
  const ticket = searchParams.get('ticket');
  const returnTo = searchParams.get('returnTo') || '/';
  
  console.log('[CAS Callback] === CALLBACK RECEIVED ===');
  console.log('[CAS Callback] Origin:', origin);
  console.log('[CAS Callback] URL:', request.url);
  console.log('[CAS Callback] Ticket:', ticket ? 'Present (' + ticket.substring(0, 20) + '...)' : 'Missing');
  console.log('[CAS Callback] ReturnTo:', returnTo);
  
  if (!ticket) {
    console.error('[CAS Callback] ❌ No ticket provided');
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>CAS Auth Error</title></head>
        <body>
          <h2>Authentication Error</h2>
          <p>No ticket provided. Please try again.</p>
          <script>
            console.error('[CAS Callback] No ticket - closing in 3 seconds');
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage({ type: 'CAS_AUTH_ERROR', error: 'no-ticket' }, '*');
                window.close();
              } else {
                window.location.href = '${origin}';
              }
            }, 3000);
          </script>
        </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  }
  
  //Try validation with localhost first (whitelisted), then fallback to origin
  console.log('[CAS Callback] Attempting validation with localhost service URL...');
  const localhostServiceUrl = `http://localhost:3000/api/auth/cas/callback?returnTo=${encodeURIComponent(returnTo)}`;
  let user = await validateCASTicket(ticket, localhostServiceUrl);
  
  if (!user) {
    console.log('[CAS Callback] Localhost validation failed, trying with origin...');
    const originServiceUrl = `${origin}/api/auth/cas/callback?returnTo=${encodeURIComponent(returnTo)}`;
    user = await validateCASTicket(ticket, originServiceUrl);
  }
  
  if (!user) {
    console.error('[CAS Callback] ❌ Both validation attempts failed');
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>CAS Auth Error</title></head>
        <body>
          <h2>Authentication Failed</h2>
          <p>Could not validate your credentials. The IT office may need to whitelist osdg.in.</p>
          <p>Technical details: Ticket validation failed for both localhost and ${origin}</p>
          <script>
            console.error('[CAS Callback] Validation failed - closing in 5 seconds');
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage({ type: 'CAS_AUTH_ERROR', error: 'validation-failed' }, '*');
                window.close();
              } else {
                window.location.href = '${origin}';
              }
            }, 5000);
          </script>
        </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  }
  
  console.log('[CAS Callback] ✅✅✅ SUCCESS! User authenticated ✅✅✅');
  console.log('[CAS Callback] Username:', user.username);
  console.log('[CAS Callback] Name:', user.name);
  console.log('[CAS Callback] Email:', user.email);
  
  // Return an HTML page that sends user data to parent window
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head><title>CAS Auth Success</title></head>
      <body>
        <h2>✅ Authentication Successful!</h2>
        <p>Welcome, <strong>${user.name}</strong> (${user.username})</p>
        <p>Logging you in...</p>
        
        <script>
          console.log('=== CAS CALLBACK SUCCESS PAGE ===');
          console.log('User:', ${JSON.stringify(user)});
          console.log('Window opener exists:', !!window.opener);
          console.log('Current origin:', window.location.origin);
          
          const userData = {
            type: 'CAS_AUTH_SUCCESS',
            user: {
              username: ${JSON.stringify(user.username)},
              name: ${JSON.stringify(user.name)},
              email: ${JSON.stringify(user.email)}
            },
            returnTo: ${JSON.stringify(returnTo)}
          };
          
          console.log('userData to send:', userData);
          
          if (window.opener) {
            console.log('✅ Opener window found - sending postMessage');
            
            // Send to all possible origins
            try {
              window.opener.postMessage(userData, '*');
              console.log('✅ Message sent with wildcard origin');
            } catch (err) {
              console.error('❌ Error sending message:', err);
            }
            
            // Close window after delay
            console.log('Waiting 2 seconds before closing...');
            setTimeout(() => {
              console.log('Closing popup window now');
              window.close();
            }, 2000);
          } else {
            console.error('❌ No opener window - redirecting to main site');
            setTimeout(() => {
              window.location.href = '${origin}/?casAuth=success&username=' + encodeURIComponent(${JSON.stringify(user.username)});
            }, 2000);
          }
        </script>
      </body>
    </html>`,
    {
      status: 200,
      headers: { 
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}