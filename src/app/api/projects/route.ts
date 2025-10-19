import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// In-memory storage for now
// For Docker persistent storage, you can:
// 1. Use a volume-mounted JSON file: const fs = require('fs'); const path = '/data/projects.json';
// 2. Connect to a database (MongoDB, PostgreSQL, etc.) via environment variables
// 3. Use Docker volumes: docker run -v /path/on/host:/data your-image
let projects: any[] = [];

export async function GET() {
  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication using JWT token from cas-auth cookie
    const token = request.cookies.get('cas-auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 });
    }

    // Verify JWT token
    let user;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = {
        username: payload.username,
        name: payload.name,
        email: payload.email
      };
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, siteLink, dateInitiated, instructionBook, imageUrl } = body;

    if (!title || !description || !siteLink || !dateInitiated) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProject = {
      id: Date.now().toString(),
      title,
      description,
      siteLink,
      dateInitiated,
      instructionBook: instructionBook || '',
      imageUrl: imageUrl || '',
      addedBy: user.username,
      createdAt: new Date().toISOString(),
    };

    projects.unshift(newProject);

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Error adding project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
