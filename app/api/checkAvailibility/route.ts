import { graphClient } from '@/app/utils/GraphClient';
import { NextResponse } from 'next/server';
import { addDays } from 'date-fns';

export async function POST(request: Request) {
  try {
    const { userEmail, startDate, endDate, days } = await request.json();
    
    // Use provided email or default from env
    const email = userEmail || process.env.NEXT_USER_EMAIL;
    
    if (!email) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }
    
    // Set date range for calendar check
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate 
      ? new Date(endDate) 
      : addDays(start, days || 7); // Default to 7 days if not specified
    end.setHours(23, 59, 59, 999);
    
    console.log(`Fetching calendar for ${email} from ${start.toISOString()} to ${end.toISOString()}`);
    
    // Get calendar events
    const calendarEvents = await graphClient
      .api(`/users/${email}/calendar/calendarView`)
      .query({
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        $select: 'subject,start,end,location,attendees,organizer,bodyPreview,isAllDay',
        $orderby: 'start/dateTime'
      })
      .get();
    
    // Format the events
    const events = calendarEvents.value.map((event: any) => ({
      id: event.id,
      subject: event.subject,
      start: event.start.dateTime,
      end: event.end.dateTime,
      timeZone: event.start.timeZone,
      location: event.location?.displayName || '',
      isAllDay: event.isAllDay,
      organizer: event.organizer?.emailAddress?.address || '',
      attendees: event.attendees?.map((a: any) => ({
        email: a.emailAddress.address,
        name: a.emailAddress.name,
        status: a.status.response
      })) || [],
      bodyPreview: event.bodyPreview
    }));
    
    return NextResponse.json({
      success: true,
      email,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      count: events.length,
      events
    });
    
  } catch (error: any) {
    console.error('Error reading calendar:', error);
    return NextResponse.json(
      { 
        error: 'Failed to read calendar',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail') || process.env.NEXT_USER_EMAIL;
    const days = parseInt(searchParams.get('days') || '7');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }
    
    // Set date range
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = addDays(start, days);
    end.setHours(23, 59, 59, 999);
    
    console.log(`Fetching calendar for ${userEmail} from ${start.toISOString()} to ${end.toISOString()}`);
    
    // Get calendar events
    const calendarEvents = await graphClient
      .api(`/users/${userEmail}/calendar/calendarView`)
      .query({
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        $select: 'subject,start,end,location,attendees,organizer,bodyPreview,isAllDay',
        $orderby: 'start/dateTime'
      })
      .get();
    
    // Format the events
    const events = calendarEvents.value.map((event: any) => ({
      id: event.id,
      subject: event.subject,
      start: event.start.dateTime,
      end: event.end.dateTime,
      timeZone: event.start.timeZone,
      location: event.location?.displayName || '',
      isAllDay: event.isAllDay,
      organizer: event.organizer?.emailAddress?.address || '',
      attendees: event.attendees?.map((a: any) => ({
        email: a.emailAddress.address,
        name: a.emailAddress.name,
        status: a.status.response
      })) || [],
      bodyPreview: event.bodyPreview
    }));
    
    return NextResponse.json({
      success: true,
      email: userEmail,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      count: events.length,
      events
    });
    
  } catch (error: any) {
    console.error('Error reading calendar:', error);
    return NextResponse.json(
      { 
        error: 'Failed to read calendar',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
