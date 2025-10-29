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
  const baseUrl = origin.includes('localhost') ? origin : 'https://www.osdg.in';
  const serviceUrl = `${baseUrl}/api/auth/cas/callback?returnTo=${encodeURIComponent(returnTo)}`;
  
  console.log('[CAS Callback] Using CLIENT-SIDE validation (requires IIIT WiFi)');
  console.log('[CAS Callback] Service URL:', serviceUrl);
  
  // Return HTML page that validates ticket in browser (only works on IIIT WiFi)
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Completing CAS Login...</title>
  <style>
    body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0a0a0a; color: #fff; }
    .container { text-align: center; max-width: 500px; padding: 2rem; }
    .spinner { border: 3px solid #333; border-top: 3px solid #fff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .error { color: #ff6b6b; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Completing CAS Login...</h2>
    <p>Validating your credentials (requires IIIT WiFi)</p>
    <div id="status"></div>
  </div>
  <script>
    (async function() {
      const statusEl = document.getElementById('status');
      
      try {
        const ticket = '${ticket}';
        const returnTo = '${returnTo}';
        const serviceUrl = '${serviceUrl}';
        
        statusEl.textContent = 'Contacting CAS server...';
        
        // Validate ticket from browser (only works on IIIT WiFi with CORS)
        const validateUrl = '${CAS_BASE_URL}/serviceValidate?service=' + encodeURIComponent(serviceUrl) + '&ticket=' + encodeURIComponent(ticket) + '&format=JSON';
        
        console.log('[Client CAS] Validating ticket:', validateUrl);
        
        const response = await fetch(validateUrl, { 
          credentials: 'omit',
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error('CAS returned status ' + response.status);
        }
        
        const data = await response.json();
        console.log('[Client CAS] Response:', data);
        
        if (data.serviceResponse && data.serviceResponse.authenticationSuccess) {
          const attrs = data.serviceResponse.authenticationSuccess.attributes || {};
          const username = (attrs.uid && attrs.uid[0]) || attrs.uid || 'cas_user';
          const name = (attrs.Name && attrs.Name[0]) || attrs.Name || username;
          const email = (attrs['E-Mail'] && attrs['E-Mail'][0]) || attrs['E-Mail'] || (username + '@students.iiit.ac.in');
          
          statusEl.textContent = 'Authentication successful! Logging you in...';
          
          // Send validated data to server to create session
          const completeResp = await fetch('/api/auth/cas/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, name, email })
          });
          
          if (completeResp.ok) {
            window.location.href = returnTo;
          } else {
            throw new Error('Server session creation failed');
          }
        } else if (data.serviceResponse && data.serviceResponse.authenticationFailure) {
          throw new Error('CAS authentication failed: ' + (data.serviceResponse.authenticationFailure.description || 'Unknown error'));
        } else {
          throw new Error('Unexpected CAS response format');
        }
      } catch (error) {
        console.error('[Client CAS] Error:', error);
        statusEl.innerHTML = '<div class="error">❌ Authentication failed: ' + error.message + '<br><br>Make sure you are on IIIT WiFi.<br><a href="/" style="color: #4da6ff;">Go back to home</a></div>';
      }
    })();
  </script>
</body>
</html>`;
  
  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}