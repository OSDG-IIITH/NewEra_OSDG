import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

// Load projects from file
function loadProjects(): any[] {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      console.log('[Projects API] Creating data directory:', DATA_DIR);
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
      const projects = JSON.parse(data);
      console.log('[Projects API] Loaded', projects.length, 'projects');
      return projects;
    } else {
      console.log('[Projects API] No projects file found, initializing empty array');
      // Initialize with empty array
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
  } catch (error) {
    console.error('[Projects API] Error loading projects:', error);
    return [];
  }
}

// Save projects to file
function saveProjects(projects: any[]): void {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
    console.log('[Projects API] Saved', projects.length, 'projects');
  } catch (error) {
    console.error('[Projects API] Error saving projects:', error);
    throw error;
  }
}

export async function GET() {
  try {
    console.log('[Projects API] GET request received');
    const projects = loadProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('[Projects API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load projects', projects: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Projects API] POST request received');
    const body = await request.json();
    const { title, description, siteLink, dateInitiated, instructionBook, imageUrl, addedBy } = body;

    if (!title || !description || !siteLink || !dateInitiated) {
      console.error('[Projects API] Missing required fields:', { title: !!title, description: !!description, siteLink: !!siteLink, dateInitiated: !!dateInitiated });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const projects = loadProjects();

    const newProject = {
      id: Date.now().toString(),
      title,
      description,
      siteLink,
      dateInitiated,
      instructionBook: instructionBook || '',
      imageUrl: imageUrl || '',
      addedBy: addedBy || 'Anonymous',
      createdAt: new Date().toISOString(),
    };

    projects.unshift(newProject);
    saveProjects(projects);

    console.log('[Projects API] ✅ New project added:', newProject.title);

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error('[Projects API] POST error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}

// Add other HTTP methods to prevent 405 errors
export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: 'Method not implemented' }, { status: 501 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'Method not implemented' }, { status: 501 });
}
