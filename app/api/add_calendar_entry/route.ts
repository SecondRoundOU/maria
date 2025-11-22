import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VapiRequest } from '@/lib/types';
import axios from 'axios';

// Function to get caller information
async function getCallerInfo(phoneNumber: string, host: string): Promise<any> {
  try {
    // Construct the full URL using the host from the request
    const apiUrl = `${host}/api/caller_id`;
    
    // Make a request to our own caller ID API
    const response = await axios.post(apiUrl, {
      message: {
        toolCalls: [
          {
            id: "internal-call",
            function: {
              name: "getCallerId",
              arguments: {
                phoneNumber
              }
            }
          }
        ]
      }
    });
    
    if (response.status === 200 && response.data?.results?.[0]?.result) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching caller information:', error);
    return null;
  }
}

// Function to get the latest Todo
async function getLatestTodo(baseUrl: string): Promise<any> {
  try {
    // Construct the full URL using the host
    const apiUrl = `${baseUrl}/api/get_latest_todo`;
    
    // Make a request to our dedicated latest todo API
    const response = await axios.post(apiUrl, {
      message: {
        toolCalls: [
          {
            id: "internal-call",
            function: {
              name: "getLatestTodo",
              arguments: {}
            }
          }
        ]
      }
    });
    
    if (response.status === 200) {
      // Check if this is a VAPI response format
      if (response.data?.results?.[0]?.result) {
        return response.data.results[0].result;
      }
      // Or a direct API response
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching latest todo:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body: VapiRequest = await request.json();
    
    let toolCall;
    for (const tc of body.message.toolCalls) {
      if (tc.function.name === 'addCalendarEntry') {
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
    
    // Ensure args is an object
    const argsObj = typeof args === 'string' ? {} : args as Record<string, any>;
    
    const title = argsObj.title || '';
    let description = argsObj.description || '';
    const event_from_str = argsObj.event_from || '';
    const event_to_str = argsObj.event_to || '';
    const phoneNumber = argsObj.phoneNumber || null;
    
    if (!title || !event_from_str || !event_to_str) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get the host from the request
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    
    // Fetch the latest Todo
    const latestTodo = await getLatestTodo(baseUrl);
    
    // If a phone number is provided, fetch caller information
    if (phoneNumber) {
      try {
        const callerInfo = await getCallerInfo(phoneNumber, baseUrl);
        
        if (callerInfo) {
          // Add the caller information to the description
          const callerDetails = callerInfo.results[0].result;
          const callerInfoText = `
----- Caller Information -----
Name: ${callerDetails.name || 'N/A'}
Phone: ${phoneNumber}
Type: ${callerDetails.type || 'N/A'}
Location: ${callerDetails.location || 'N/A'}
Carrier: ${callerDetails.carrier || 'N/A'}
${callerDetails.licensePlate ? 'License Plate: ' + callerDetails.licensePlate : ''}
Spam Likelihood: ${callerDetails.spamLikelihood || 'N/A'}
Source: ${callerDetails.source || 'N/A'}
-----------------------------
`;
          
          // Append or prepend caller info to description
          if (description) {
            description = description + '\n\n' + callerInfoText;
          } else {
            description = callerInfoText;
          }
        }
      } catch (error) {
        console.error('Error processing caller information:', error);
        // Continue without caller info if there's an error
      }
    }
    
    try {
      const event_from = new Date(event_from_str);
      const event_to = new Date(event_to_str);
      
      // Create the calendar event with the latest Todo as a nested object
      const calendarEvent = await prisma.calendarEvent.create({
        data: {
          title,
          description,
          event_from,
          event_to
        }
      });
      
      // Create the response object with the calendar event and the latest Todo
      const responseObject = {
        ...calendarEvent,
        latestTodo: latestTodo || null
      };
      
      return NextResponse.json({
        results: [
          {
            toolCallId: toolCall.id,
            result: responseObject
          }
        ]
      });
    } catch (error) {
      return NextResponse.json({ error: 'Invalid date format. Use ISO format.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error adding calendar entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
