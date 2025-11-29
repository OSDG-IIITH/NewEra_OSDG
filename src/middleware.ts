// Middleware to inject user credentials from session into API requests
// This middleware automatically adds user info to headers for authenticated routes

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only process API routes that need user authentication
  const formsApiPaths = [
    '/api/forms-proxy',
    '/api/chat/vetal-forms',
  ];

  const isFormsApi = formsApiPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isFormsApi) {
    // Try to get user from session storage (via cookie or session)
    const casUser = request.cookies.get('cas-user');
    
    if (casUser) {
      try {
        const userData = JSON.parse(casUser.value);
        
        // Clone the request and add user headers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-email', userData.email || '');
        requestHeaders.set('x-user-name', userData.name || '');
        requestHeaders.set('x-user-handle', userData.username || '');

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } catch (error) {
        console.error('[Middleware] Error parsing user data:', error);
      }
    }

    // If no user cookie found, they need to be authenticated
    // The API will return 401 if user headers are missing
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/forms-proxy/:path*',
    '/api/chat/vetal-forms',
  ],
};
