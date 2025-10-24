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
  
  if (!ticket) {
    // Return an HTML page that sends error message to parent window
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>CAS Auth Error</title></head>
        <body>
          <script>
            console.error('[CAS Callback] ERROR: No ticket provided');
            console.log('[CAS Callback] Window opener exists:', !!window.opener);
            
            if (window.opener) {
              const origins = ['https://osdg.in', 'http://localhost:3000'];
              origins.forEach(origin => {
                try {
                  window.opener.postMessage({ type: 'CAS_AUTH_ERROR', error: 'no-ticket' }, origin);
                  console.log('[CAS Callback] Error message sent to', origin);
                } catch (err) {
                  console.error('[CAS Callback] Failed to send to', origin, err);
                }
              });
              setTimeout(() => window.close(), 1000);
            } else {
              alert('Authentication failed: No ticket. Please try again.');
            }
          </script>
          <p>Authentication failed. Redirecting...</p>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
  
  // Use localhost for CAS validation since production domain isn't whitelisted yet
  const serviceUrl = `http://localhost:3000/api/auth/cas/callback?returnTo=${encodeURIComponent(returnTo)}`;
  const user = await validateCASTicket(ticket, serviceUrl);
  
  if (!user) {
    // Return an HTML page that sends error message to parent window
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>CAS Auth Error</title></head>
        <body>
          <script>
            console.error('[CAS Callback] ERROR: Ticket validation failed');
            console.log('[CAS Callback] Window opener exists:', !!window.opener);
            
            if (window.opener) {
              const origins = ['https://osdg.in', 'http://localhost:3000'];
              origins.forEach(origin => {
                try {
                  window.opener.postMessage({ type: 'CAS_AUTH_ERROR', error: 'validation-failed' }, origin);
                  console.log('[CAS Callback] Error message sent to', origin);
                } catch (err) {
                  console.error('[CAS Callback] Failed to send to', origin, err);
                }
              });
              setTimeout(() => window.close(), 1000);
            } else {
              alert('Authentication failed: Validation failed. Please try again.');
            }
          </script>
          <p>Authentication failed. Redirecting...</p>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
  
  // Return an HTML page that sends user data to parent window (osdg.in)
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head><title>CAS Auth Success</title></head>
      <body>
        <script>
          console.log('[CAS Callback] Starting authentication callback');
          console.log('[CAS Callback] User data:', ${JSON.stringify(user)});
          console.log('[CAS Callback] Window opener exists:', !!window.opener);
          
          const userData = {
            type: 'CAS_AUTH_SUCCESS',
            user: {
              username: ${JSON.stringify(user.username)},
              name: ${JSON.stringify(user.name)},
              email: ${JSON.stringify(user.email)}
            },
            returnTo: ${JSON.stringify(returnTo)}
          };
          
          if (window.opener) {
            console.log('[CAS Callback] Sending message to parent window');
            
            // Send to all possible origins - the browser will deliver to the correct one
            const origins = ['https://osdg.in', 'http://localhost:3000'];
            
            origins.forEach(origin => {
              try {
                console.log('[CAS Callback] Sending to origin:', origin);
                window.opener.postMessage(userData, origin);
              } catch (err) {
                console.error('[CAS Callback] Error sending to', origin, err);
              }
            });
            
            console.log('[CAS Callback] Messages sent, waiting before close');
            
            // Wait longer to ensure message is received
            setTimeout(() => {
              console.log('[CAS Callback] Closing popup window');
              window.close();
            }, 1000);
          } else {
            console.error('[CAS Callback] No opener window found!');
            alert('Authentication successful! Please close this window and refresh the main page.');
          }
        </script>
        <h2>Authentication Successful!</h2>
        <p>Closing window and logging you in...</p>
        <p style="color: #666; font-size: 12px;">If this window doesn't close, you can close it manually.</p>
      </body>
    </html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    }
  );
}