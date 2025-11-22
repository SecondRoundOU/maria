import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get the URL parameters
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    
    // Set CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    if (type === 'lookups') {
      // Mock lookups since Prisma is removed
      const lookups = [
        { id: 1, phoneNumber: '+1234567890', lookupResult: '{"name":"Sample"}', timestamp: new Date() }
      ];
      
      return NextResponse.json({ lookups }, { headers: corsHeaders });
    } else if (type === 'calls') {
      // Mock calls since Prisma is removed
      const calls = [
        { id: 1, to: '+1234567890', from: '+0987654321', callSid: 'CA123', status: 'completed', timestamp: new Date() }
      ];
      
      return NextResponse.json({ calls }, { headers: corsHeaders });
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { 
        status: 400,
        headers: corsHeaders
      });
    }
  } catch (error) {
    console.error('Error fetching caller ID history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

export async function OPTIONS(request: Request) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
