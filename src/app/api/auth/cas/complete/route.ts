// Server endpoint to create session after client-side CAS validation
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, name, email } = body || {};
    
    console.log('[CAS Complete] === SESSION CREATION ===');
    console.log('[CAS Complete] Username:', username);
    console.log('[CAS Complete] Name:', name);
    console.log('[CAS Complete] Email:', email);
    
    if (!username) {
      console.error('[CAS Complete] ❌ No username provided');
      return NextResponse.json({ ok: false, error: 'missing-username' }, { status: 400 });
    }
    
    // Create session cookie with user data
    // Simple base64-encoded session (replace with proper session management in production)
    const sessionData = { username, name, email, timestamp: Date.now() };
    const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString('base64');
    
    const response = NextResponse.json({ ok: true });
    
    // Set session cookie (1 hour expiry)
    response.headers.append(
      'Set-Cookie',
      `osdg_session=${sessionValue}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`
    );
    
    console.log('[CAS Complete] ✅ Session created successfully');
    
    return response;
  } catch (error) {
    console.error('[CAS Complete] ❌ Error:', error);
    return NextResponse.json({ ok: false, error: 'internal-error' }, { status: 500 });
  }
}
