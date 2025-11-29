// OSDG Forms Proxy - Vetal AI Connector
// This API proxies requests to the forms backend with OSDG authentication

import { NextRequest, NextResponse } from 'next/server';

const FORMS_BACKEND_URL = process.env.FORMS_BACKEND_URL || 'http://localhost:8647';
const OSDG_AUTH_SECRET = process.env.FORMS_OSDG_AUTH_SECRET || 'your-secure-shared-secret-here';

export async function GET(request: NextRequest) {
  return proxyToForms(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyToForms(request, 'POST');
}

export async function PATCH(request: NextRequest) {
  return proxyToForms(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return proxyToForms(request, 'DELETE');
}

async function proxyToForms(request: NextRequest, method: string) {
  try {
    // Get user info from OSDG session
    const userEmail = request.headers.get('x-user-email');
    const userName = request.headers.get('x-user-name');
    const userHandle = request.headers.get('x-user-handle');

    if (!userEmail || !userName) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to OSDG' },
        { status: 401 }
      );
    }

    // Build target URL
    const pathname = request.nextUrl.pathname.replace('/api/forms-proxy', '');
    const searchParams = request.nextUrl.searchParams.toString();
    const targetUrl = `${FORMS_BACKEND_URL}/api${pathname}${searchParams ? '?' + searchParams : ''}`;

    console.log('[Forms Proxy] Proxying to:', targetUrl);

    // Prepare headers for forms backend
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('X-OSDG-User-Email', userEmail);
    headers.set('X-OSDG-User-Name', userName);
    headers.set('X-OSDG-User-Handle', userHandle || '');
    headers.set('X-OSDG-Auth-Secret', OSDG_AUTH_SECRET);

    // Prepare request body for POST/PATCH
    let body = undefined;
    if (method === 'POST' || method === 'PATCH') {
      const text = await request.text();
      if (text) {
        body = text;
      }
    }

    // Make request to forms backend
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const data = await response.text();
    
    // Return response from forms backend
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[Forms Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
