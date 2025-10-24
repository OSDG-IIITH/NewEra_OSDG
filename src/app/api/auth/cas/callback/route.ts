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
        <head><title>CAS Auth</title></head>
        <body>
          <script>
            if (window.opener) {
              const targetOrigin = window.opener.location.origin;
              window.opener.postMessage({ type: 'CAS_AUTH_ERROR', error: 'no-ticket' }, targetOrigin);
              setTimeout(() => window.close(), 500);
            } else {
              const baseUrl = document.referrer || 'https://osdg.in';
              window.location.href = baseUrl + '?error=no-ticket';
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
        <head><title>CAS Auth</title></head>
        <body>
          <script>
            if (window.opener) {
              const targetOrigin = window.opener.location.origin;
              window.opener.postMessage({ type: 'CAS_AUTH_ERROR', error: 'validation-failed' }, targetOrigin);
              setTimeout(() => window.close(), 500);
            } else {
              const baseUrl = document.referrer || 'https://osdg.in';
              window.location.href = baseUrl + '?error=validation-failed';
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
          const userData = {
            type: 'CAS_AUTH_SUCCESS',
            user: {
              username: ${JSON.stringify(user.username)},
              name: ${JSON.stringify(user.name)},
              email: ${JSON.stringify(user.email)}
            },
            returnTo: ${JSON.stringify(returnTo)}
          };
          
          console.log('Sending auth data to parent:', userData);
          
          if (window.opener) {
            // Send data to parent window
            // For production (osdg.in), send to https://osdg.in
            // For local development, send to http://localhost:3000
            const targetOrigin = window.opener.location.origin;
            console.log('Target origin:', targetOrigin);
            
            try {
              window.opener.postMessage(userData, targetOrigin);
              console.log('Message sent successfully');
              
              // Close after a short delay to ensure message is received
              setTimeout(() => {
                window.close();
              }, 500);
            } catch (err) {
              console.error('Error sending message:', err);
              // Fallback: try closing anyway
              setTimeout(() => {
                window.close();
              }, 1000);
            }
          } else {
            // Fallback: redirect to the opener's origin with data in URL
            console.log('No opener window found, using fallback redirect');
            const baseUrl = document.referrer || 'https://osdg.in';
            const url = new URL(${JSON.stringify(returnTo)}, baseUrl);
            url.searchParams.set('username', ${JSON.stringify(user.username)});
            url.searchParams.set('email', ${JSON.stringify(user.email)});
            url.searchParams.set('casAuth', 'true');
            window.location.href = url.toString();
          }
        </script>
        <p>Authentication successful! Closing window...</p>
      </body>
    </html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    }
  );
}