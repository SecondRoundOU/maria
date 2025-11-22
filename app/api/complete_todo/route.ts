import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VapiRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: VapiRequest = await request.json();
    
    let toolCall;
    for (const tc of body.message.toolCalls) {
      if (tc.function.name === 'completeTodo') {
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
    
    const todoId = args.id;
    
    if (!todoId) {
      return NextResponse.json({ error: 'Missing To-Do ID' }, { status: 400 });
    }
    
    const todo = await prisma.todo.findUnique({
      where: { id: todoId }
    });
    
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    
    await prisma.todo.update({
      where: { id: todoId },
      data: { completed: true }
    });
    
    return NextResponse.json({
      results: [
        {
          toolCallId: toolCall.id,
          result: 'success'
        }
      ]
    });
  } catch (error) {
    console.error('Error completing todo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
