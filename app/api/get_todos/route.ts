import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VapiRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: VapiRequest = await request.json();
    
    let toolCall;
    for (const tc of body.message.toolCalls) {
      if (tc.function.name === 'getTodos') {
        toolCall = tc;
        break;
      }
    }
    
    if (!toolCall) {
      return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
    
    const todos = await prisma.todo.findMany();
    
    return NextResponse.json({
      results: [
        {
          toolCallId: toolCall.id,
          result: todos
        }
      ]
    });
  } catch (error) {
    console.error('Error getting todos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
