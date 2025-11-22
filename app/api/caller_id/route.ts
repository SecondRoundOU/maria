import { NextResponse } from 'next/server';
import { VapiRequest } from '@/lib/types';
import { Twilio } from 'twilio';
import axios from 'axios';
import { z } from 'zod';

// Schema for validating caller ID requests
const callerIdSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  name: z.string().optional(),
  callbackUrl: z.string().optional(),
});

// Schema for validating Twilio call requests
const twilioCallSchema = z.object({
  to: z.string().min(1, "To phone number is required"),
  from: z.string().min(1, "From phone number is required"),
  callbackUrl: z.string().optional(),
});

// Handle CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body: VapiRequest = await request.json();
    
    let toolCall;
    for (const tc of body.message.toolCalls) {
      if (tc.function.name === 'getCallerId' || tc.function.name === 'makeCall') {
        toolCall = tc;
        break;
      }
    }
    
    if (!toolCall) {
      return NextResponse.json({ error: 'Invalid Request' }, { 
        status: 400,
        headers: corsHeaders
      });
    }
    
    let args = toolCall.function.arguments;
    if (typeof args === 'string') {
      args = JSON.parse(args);
    }
    
    // Handle different function calls
    if (toolCall.function.name === 'getCallerId') {
      return handleGetCallerId(toolCall, args);
    } else if (toolCall.function.name === 'makeCall') {
      return handleMakeCall(toolCall, args);
    }
    
    return NextResponse.json({ error: 'Unknown function' }, { 
      status: 400,
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Error processing caller ID request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

/**
 * Handle the getCallerId function call
 */
async function handleGetCallerId(toolCall: any, args: any) {
  try {
    // Validate the input
    const validation = callerIdSchema.safeParse(args);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid parameters', 
        details: validation.error.format() 
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }
    
    const { phoneNumber } = validation.data;
    
    // Format the phone number (basic formatting, can be enhanced)
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    // In a real implementation, you would query a caller ID database or service
    // For this example, we'll simulate a lookup with mock data
    const callerInfo = await lookupCallerInfo(formattedNumber);
    
    // Skip storing in database since Prisma is removed
    
    return NextResponse.json({
      results: [
        {
          toolCallId: toolCall.id,
          result: callerInfo
        }
      ]
    }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Error in getCallerId:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

/**
 * Handle the makeCall function call
 */
async function handleMakeCall(toolCall: any, args: any) {
  try {
    // Validate the input
    const validation = twilioCallSchema.safeParse(args);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid parameters', 
        details: validation.error.format() 
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }
    
    const { to, from, callbackUrl } = validation.data;
    
    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      return NextResponse.json({ error: 'Twilio credentials not configured' }, { 
        status: 500,
        headers: corsHeaders
      });
    }
    
    // Initialize Twilio client
    const client = new Twilio(accountSid, authToken);
    
    // Create the call
    const call = await client.calls.create({
      to: to,
      from: from,
      url: callbackUrl || process.env.DEFAULT_CALL_WEBHOOK_URL || 'https://demo.twilio.com/welcome/voice/'
    });
    
    // Skip storing in database since Prisma is removed
    
    return NextResponse.json({
      results: [
        {
          toolCallId: toolCall.id,
          result: {
            callSid: call.sid,
            status: call.status,
            message: 'Call initiated successfully'
          }
        }
      ]
    }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Error in makeCall:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

/**
 * Format a phone number to E.164 format (basic implementation)
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Ensure the number has a country code
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`; // Assume US number if 10 digits
  } else if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
    return `+${digitsOnly}`;
  } else if (digitsOnly.startsWith('+')) {
    return digitsOnly;
  } else {
    return `+${digitsOnly}`;
  }
}

/**
 * Look up caller information (using database)
 */
async function lookupCallerInfo(phoneNumber: string): Promise<any> {
  try {
    // Format the phone number (basic formatting, can be enhanced)
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    // Skip database lookup since Prisma is removed
    
    // If not found in our database, try the VAPI AI API if configured
    const vapiApiKey = process.env.VAPI_AI_API_KEY;
    
    if (vapiApiKey) {
      try {
        // Make a real API call to VAPI AI (hypothetical endpoint)
        const response = await axios.post('https://api.vapi.ai/caller-id', {
          phone_number: phoneNumber,
          api_key: vapiApiKey
        });
        
        if (response.status === 200) {
          return {
            ...response.data,
            source: 'vapi ai api'
          };
        }
      } catch (apiError: any) {
        console.error('Error calling VAPI AI API:', apiError);
        // Fall back to mock data on error
      }
    }
    
    // If all else fails, generate mock data based on the phone number
    // Mock data for demonstration
    const lastFourDigits = phoneNumber.slice(-4);
    
    // Simulate different caller types based on the last digit
    const lastDigit = parseInt(phoneNumber.slice(-1));
    
    if (lastDigit < 3) {
      return {
        name: `Unknown Caller (${lastFourDigits})`,
        type: 'unknown',
        spamLikelihood: 'low',
        location: 'Unknown',
        carrier: 'Unknown',
        source: 'generated'
      };
    } else if (lastDigit < 7) {
      return {
        name: `Business (${lastFourDigits})`,
        type: 'business',
        spamLikelihood: 'medium',
        location: 'New York, NY',
        carrier: 'Verizon',
        source: 'generated'
      };
    } else {
      return {
        name: `Potential Spam (${lastFourDigits})`,
        type: 'spam',
        spamLikelihood: 'high',
        location: 'Unknown',
        carrier: 'T-Mobile',
        source: 'generated'
      };
    }
  } catch (error: any) {
    console.error('Error in lookupCallerInfo:', error);
    return {
      name: 'Error retrieving caller information',
      type: 'error',
      spamLikelihood: 'unknown',
      source: 'error'
    };
  }
}
