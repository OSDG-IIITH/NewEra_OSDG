// API route for logout
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CAS_BASE_URL = process.env.CAS_BASE_URL || 'https://cas.iiit.ac.in';
const SITE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function POST() {
  try {
    const cookieStore = cookies();
    cookieStore.delete('cas-auth');
    
    // Redirect to CAS logout URL which will then redirect back to the site
    const casLogoutUrl = `${CAS_BASE_URL}/logout?url=${encodeURIComponent(SITE_URL)}`;
    
    return NextResponse.json({ 
      success: true, 
      redirectUrl: casLogoutUrl 
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}