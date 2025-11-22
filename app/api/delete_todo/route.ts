import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VapiRequest } from '@/lib/types';

export async function POST(request: Request) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  
  try {
    const body: VapiRequest = await request.json();
    
    let toolCall;
    for (const tc of body.message.toolCalls) {
      if (tc.function.name === 'deleteTodo') {
        toolCall = tc;
        break;
      }
    }
    
    if (!toolCall) {
      return NextResponse.json({ error: 'Invalid Request' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    
    let args: Record<string, any>;
    if (typeof toolCall.function.arguments === 'string') {
      args = JSON.parse(toolCall.function.arguments);
    } else {
      args = toolCall.function.arguments;
    }
    
    const todoId = args.id;
    
    if (!todoId) {
      return NextResponse.json({ error: 'Missing To-Do ID' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    
    const todo = await prisma.todo.findUnique({
      where: { id: todoId }
    });
    
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    
    await prisma.todo.delete({
      where: { id: todoId }
    });
    
    return NextResponse.json({
      results: [
        {
          toolCallId: toolCall.id,
          result: 'success'
        }
      ]
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
