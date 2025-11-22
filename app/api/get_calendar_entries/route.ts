import { NextResponse } from 'next/server';
import { VapiRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: VapiRequest = await request.json();
    
    let toolCall;
    for (const tc of body.message.toolCalls) {
      if (tc.function.name === 'getCalendarEntries') {
        toolCall = tc;
        break;
      }
    }
    
    if (!toolCall) {
      return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
    
    // Mock calendar events since Prisma is removed
    const events = [
      { id: 1, title: 'Sample Event', description: 'This is a sample event', event_from: new Date(), event_to: new Date() }
    ];
    
    return NextResponse.json({
      results: [
        {
          toolCallId: toolCall.id,
          result: events
        }
      ]
    });
  } catch (error) {
    console.error('Error getting calendar entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
