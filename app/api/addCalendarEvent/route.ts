import { graphClient } from '@/app/utils/GraphClient';
import { NextResponse } from 'next/server';
import { VapiRequest } from '@/lib/types';
import { format } from 'date-fns';

export async function POST(request: Request) {
  console.log('[addCalendarEvent] POST request received');
  
  try {
    const body = await request.json();
    console.log('[addCalendarEvent] Raw request body:', JSON.stringify(body, null, 2));
    
    // Handle VAPI payload structure
    let toolCall;
    if (body.message?.toolCalls) {
      // VAPI format
      for (const tc of body.message.toolCalls) {
        if (tc.function.name === 'addCalendarEntry') {
          toolCall = tc;
          break;
        }
      }
      
      if (!toolCall) {
        console.error('[addCalendarEvent] No matching tool call found');
        return NextResponse.json({ error: 'Invalid tool call' }, { status: 400 });
      }
    }
    
    // Extract arguments from either VAPI format or direct format
    let args: any;
    if (toolCall) {
      // VAPI format - arguments might be string or object
      args = typeof toolCall.function.arguments === 'string' 
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
      console.log('[addCalendarEvent] Parsed VAPI arguments:', args);
    } else {
      // Direct format (from calendar page)
      args = body;
    }
    
    const { userEmail, subject, description, startDateTime, endDateTime, location, attendees } = args;
    
    console.log('[addCalendarEvent] Request parameters:', {
      userEmail: userEmail || 'not provided (will use default)',
      subject,
      startDateTime,
      endDateTime,
      location: location || 'none',
      attendees: attendees?.length || 0
    });
    
    // Use provided email or default from env
    const email = userEmail || process.env.NEXT_USER_EMAIL;
    
    if (!email) {
      console.error('[addCalendarEvent] Error: User email is missing');
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }
    
    console.log('[addCalendarEvent] Using email:', email);
    
    if (!subject || !startDateTime) {
      console.error('[addCalendarEvent] Error: Missing required fields', {
        subject: !!subject,
        startDateTime: !!startDateTime
      });
      return NextResponse.json(
        { error: 'Subject and start time are required' },
        { status: 400 }
      );
    }
    
    // Parse start date and add 1 hour default if no end time provided
    const startDate = new Date(startDateTime);
    let endDate: Date;
    
    if (!endDateTime || endDateTime === '') {
      // Default to 1 hour duration
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      console.log('[addCalendarEvent] No end time provided, using 1-hour default duration');
    } else {
      endDate = new Date(endDateTime);
    }
    
    console.log('[addCalendarEvent] Parsed dates:', {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
    
    // Prepare the event data
    const event = {
      subject: subject,
      body: {
        contentType: 'HTML',
        content: description || ''
      },
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: endDate.toISOString(),
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
    
    console.log('[addCalendarEvent] Event payload prepared:', {
      subject: event.subject,
      start: event.start.dateTime,
      end: event.end.dateTime,
      location: event.location?.displayName,
      attendeesCount: event.attendees.length
    });
    
    console.log(`[addCalendarEvent] Calling Microsoft Graph API for ${email}`);
    
    // Create the event
    const createdEvent = await graphClient
      .api(`/users/${email}/calendar/events`)
      .post(event);
    
    console.log('[addCalendarEvent] Event created successfully:', {
      id: createdEvent.id,
      subject: createdEvent.subject
    });
    
    const eventData = {
      id: createdEvent.id,
      subject: createdEvent.subject,
      start: createdEvent.start.dateTime,
      end: createdEvent.end.dateTime,
      location: createdEvent.location?.displayName || '',
      description: createdEvent.bodyPreview || ''
    };
    
    // Return VAPI format if this was a VAPI call
    if (toolCall) {
      console.log('[addCalendarEvent] Returning VAPI format response');
      return NextResponse.json({
        results: [
          {
            toolCallId: toolCall.id,
            result: {
              success: true,
              event: eventData,
              message: `Event "${createdEvent.subject}" created successfully for ${format(new Date(createdEvent.start.dateTime), 'EEEE, MMMM d')} at ${format(new Date(createdEvent.start.dateTime), 'h:mm a')}`
            }
          }
        ]
      });
    }
    
    // Return direct format for calendar page
    console.log('[addCalendarEvent] Returning direct format response');
    return NextResponse.json({
      success: true,
      event: eventData
    });
    
  } catch (error: any) {
    console.error('[addCalendarEvent] Error creating calendar event:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to create calendar event',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
