import { graphClient } from '@/app/utils/GraphClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userEmail, subject, description, startDateTime, endDateTime, location, attendees } = await request.json();
    
    // Use provided email or default from env
    const email = userEmail || process.env.NEXT_USER_EMAIL;
    
    if (!email) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }
    
    if (!subject || !startDateTime || !endDateTime) {
      return NextResponse.json(
        { error: 'Subject, start time, and end time are required' },
        { status: 400 }
      );
    }
    
    // Prepare the event data
    const event = {
      subject: subject,
      body: {
        contentType: 'HTML',
        content: description || ''
      },
      start: {
        dateTime: new Date(startDateTime).toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: new Date(endDateTime).toISOString(),
        timeZone: 'UTC'
      },
      location: location ? {
        displayName: location
      } : undefined,
      attendees: attendees ? attendees.map((email: string) => ({
        emailAddress: {
          address: email
        },
        type: 'required'
      })) : []
    };
    
    console.log(`Creating calendar event for ${email}:`, event.subject);
    
    // Create the event
    const createdEvent = await graphClient
      .api(`/users/${email}/calendar/events`)
      .post(event);
    
    return NextResponse.json({
      success: true,
      event: {
        id: createdEvent.id,
        subject: createdEvent.subject,
        start: createdEvent.start.dateTime,
        end: createdEvent.end.dateTime,
        location: createdEvent.location?.displayName || '',
        description: createdEvent.bodyPreview || ''
      }
    });
    
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create calendar event',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
