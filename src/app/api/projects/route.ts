import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for now (replace with database in production)
let projects: any[] = [];

export async function GET() {
  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication (get user from session/cookie)
    const userCookie = request.cookies.get('user');
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      addedBy: JSON.parse(userCookie.value).username,
      createdAt: new Date().toISOString(),
    };

    projects.unshift(newProject);

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Error adding project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
