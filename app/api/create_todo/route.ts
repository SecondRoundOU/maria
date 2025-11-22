import { NextResponse } from 'next/server';
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
      if (tc.function.name === 'createTodo') {
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

    const params = typeof toolCall.function.arguments === 'string'
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;
    const { title, description = '' } = params;

    // Mock todo creation (since Prisma is removed)
    const todo = {
      id: Date.now(),
      title,
      description,
      completed: false
    };

    return NextResponse.json({
      results: [
        {
          toolCallId: toolCall.id,
          result: todo
        }
      ]
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}