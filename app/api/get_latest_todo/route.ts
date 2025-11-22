import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VapiRequest } from '@/lib/types';

/**
 * API endpoint to fetch the latest Todo item
 * Can be called directly or via VAPI function call
 */
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
    let toolCallId = null;
    
    // Check if this is a VAPI request
    try {
      const body: VapiRequest = await request.json();
      
      // Find the getLatestTodo tool call
      for (const tc of body.message.toolCalls) {
        if (tc.function.name === 'getLatestTodo') {
          toolCallId = tc.id;
          break;
        }
      }
    } catch (error) {
      // Not a VAPI request or invalid JSON, continue without toolCallId
    }
    
    // Fetch the latest Todo by getting the one with the highest ID
    const latestTodo = await prisma.todo.findFirst({
      orderBy: {
        id: 'desc'
      }
    });
    
    // If this was called as a VAPI function, format the response accordingly
    if (toolCallId) {
      return NextResponse.json({
        results: [
          {
            toolCallId,
            result: latestTodo || null
          }
        ]
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    
    // Otherwise, return a standard API response
    return NextResponse.json(latestTodo || null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error fetching latest todo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
