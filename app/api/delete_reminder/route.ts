import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VapiRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: VapiRequest = await request.json();
    
    let toolCall;
    for (const tc of body.message.toolCalls) {
      if (tc.function.name === 'deleteReminder') {
        toolCall = tc;
        break;
      }
    }
    
    if (!toolCall) {
      return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
    
    let args: Record<string, any>;
    if (typeof toolCall.function.arguments === 'string') {
      args = JSON.parse(toolCall.function.arguments);
    } else {
      args = toolCall.function.arguments;
    }
    
    const reminderId = args.id;
    
    if (!reminderId) {
      return NextResponse.json({ error: 'Missing reminder ID' }, { status: 400 });
    }
    
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId }
    });
    
    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }
    
    await prisma.reminder.delete({
      where: { id: reminderId }
    });
    
    return NextResponse.json({
      results: [
        {
          toolCallId: toolCall.id,
          result: { id: reminderId, deleted: true }
        }
      ]
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
