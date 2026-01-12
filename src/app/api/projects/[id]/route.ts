import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const projectId = params.id;
    console.log('[Projects API] DELETE request for project:', projectId);
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) {
      console.error('[Projects API] Supabase delete error:', error);
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
    
    console.log('[Projects API] ✅ Project deleted:', projectId);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Projects API] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
