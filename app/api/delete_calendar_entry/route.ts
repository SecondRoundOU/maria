import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VapiRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: VapiRequest = await request.json();
    
    let toolCall;
    for (const tc of body.message.toolCalls) {
      if (tc.function.name === 'deleteCalendarEntry') {
        toolCall = tc;
        break;
      }
    }
    
    if (!toolCall) {
      return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
    
    let args = toolCall.function.arguments;
    if (typeof args === 'string') {
      args = JSON.parse(args);
    }
    
    const eventId = args.id;
    
    if (!eventId) {
      return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
    }
    
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId }
    });
    
    if (!event) {
      return NextResponse.json({ error: 'Calendar event not found' }, { status: 404 });
    }
    
    await prisma.calendarEvent.delete({
      where: { id: eventId }
    });
    
    return NextResponse.json({
      results: [
        {
          toolCallId: toolCall.id,
          result: { id: eventId, deleted: true }
        }
      ]
    });
  } catch (error) {
    console.error('Error deleting calendar entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
