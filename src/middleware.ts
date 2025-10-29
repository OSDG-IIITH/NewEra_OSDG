import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = url.hostname;
  
  // Redirect www.osdg.in to osdg.in for CAS compatibility
  // CAS requires exact service URL matching, so we must be consistent
  if (hostname.startsWith('www.')) {
    url.hostname = hostname.replace('www.', '');
    console.log(`[Middleware] Redirecting ${hostname} → ${url.hostname}`);
    return NextResponse.redirect(url, 301); // Permanent redirect
  }
  
  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
