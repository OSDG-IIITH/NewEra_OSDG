import { NextRequest, NextResponse } from 'next/server';

// Import the projects array from the main route (this is a simplified approach)
// In production, use a database
const projectsStore: any[] = [];

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const userCookie = request.cookies.get('user');
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    
    // Find and remove project (in production, use database)
    // For now, we'll just return success
    // You'll need to implement proper data persistence
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
