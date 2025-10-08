// API route to get current user information
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('cas-auth')?.value;
    
    if (!token) {
      return NextResponse.json({ user: null });
    }
    
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return NextResponse.json({
      user: {
        username: payload.username,
        name: payload.name,
        email: payload.email,
        rollno: payload.rollno
      }
    });
  } catch (error) {
    console.error('JWT verification error:', error);
    return NextResponse.json({ user: null });
  }
}