// API route for logout - Clears session and redirects back to website
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST() {
  try {
    const cookieStore = cookies();
    cookieStore.delete('cas-auth');
    
    // Return success and redirect to home page
    return NextResponse.json({ 
      success: true, 
      redirectUrl: SITE_URL 
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    cookieStore.delete('cas-auth');
    
    // Direct GET redirect back to home page
    return NextResponse.redirect(SITE_URL);
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(SITE_URL);
  }
}