import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load projects from file
function loadProjects(): any[] {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading projects:', error);
  }
  return [];
}

// Save projects to file
function saveProjects(projects: any[]): void {
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving projects:', error);
  }
}

export async function GET() {
  const projects = loadProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, siteLink, dateInitiated, instructionBook, imageUrl, addedBy } = body;

    if (!title || !description || !siteLink || !dateInitiated) {
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

    console.log('[Projects API] New project added:', newProject.title);

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Error adding project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
