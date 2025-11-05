import { NextRequest, NextResponse } from 'next/server';
import { supabase, ProjectInsert } from '@/utils/supabase';

// GET all projects from Supabase
export async function GET() {
  try {
    console.log('[Projects API] GET request received');
    
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Projects API] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to load projects', projects: [] }, { status: 500 });
    }

    console.log('[Projects API] Loaded', projects?.length || 0, 'projects');
    return NextResponse.json({ projects: projects || [] });
  } catch (error) {
    console.error('[Projects API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load projects', projects: [] }, { status: 500 });
  }
}

// POST - Add a new project to Supabase
export async function POST(request: NextRequest) {
  try {
    console.log('[Projects API] POST request received');
    const body = await request.json();
    const { title, description, siteLink, dateInitiated, instructionBook, imageUrl, addedBy } = body;

    if (!title || !description || !siteLink || !dateInitiated) {
      console.error('[Projects API] Missing required fields:', { 
        title: !!title, 
        description: !!description, 
        siteLink: !!siteLink, 
        dateInitiated: !!dateInitiated 
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProject: ProjectInsert = {
      title,
      description,
      site_link: siteLink,
      date_initiated: dateInitiated,
      instruction_book: instructionBook || null,
      image_url: imageUrl || null,
      added_by: addedBy || 'Anonymous',
    };

    const { data: project, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select()
      .single();

    if (error) {
      console.error('[Projects API] Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to add project', details: error.message }, { status: 500 });
    }

    console.log('[Projects API] ✅ New project added:', project.title);

    // Convert snake_case to camelCase for frontend consistency
    const formattedProject = {
      id: project.id,
      title: project.title,
      description: project.description,
      siteLink: project.site_link,
      dateInitiated: project.date_initiated,
      instructionBook: project.instruction_book,
      imageUrl: project.image_url,
      addedBy: project.added_by,
      createdAt: project.created_at,
    };

    return NextResponse.json({ project: formattedProject }, { status: 201 });
  } catch (error) {
    console.error('[Projects API] POST error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'Method not implemented' }, { status: 501 });
}
