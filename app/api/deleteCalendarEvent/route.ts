import { graphClient } from '@/app/utils/GraphClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userEmail, eventId } = await request.json();
    
    // Use provided email or default from env
    const email = userEmail || process.env.NEXT_USER_EMAIL;
    
    if (!email) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Deleting calendar event ${eventId} for ${email}`);
    
    // Delete the event
    await graphClient
      .api(`/users/${email}/calendar/events/${eventId}`)
      .delete();
    
    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete calendar event',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
