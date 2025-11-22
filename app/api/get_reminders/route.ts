import { NextResponse } from 'next/server';
import { VapiRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: VapiRequest = await request.json();
    
    let toolCall;
    for (const tc of body.message.toolCalls) {
      if (tc.function.name === 'getReminders') {
        toolCall = tc;
        break;
      }
    }
    
    if (!toolCall) {
      return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
    
    // Mock reminders since Prisma is removed
    const reminders = [
      { id: 1, reminder_text: 'Sample Reminder', importance: 'high' }
    ];
    
    return NextResponse.json({
      results: [
        {
          toolCallId: toolCall.id,
          result: reminders
        }
      ]
    });
  } catch (error) {
    console.error('Error getting reminders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
