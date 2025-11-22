import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      // Get caller lookups from the database using raw query
      const lookups = await prisma.$queryRaw`
        SELECT * FROM "CallerLookup"
        ORDER BY "timestamp" DESC
        LIMIT 50
      `;
      
      return NextResponse.json({ lookups }, { headers: corsHeaders });
    } else if (type === 'calls') {
      // Get call records from the database using raw query
      const calls = await prisma.$queryRaw`
        SELECT * FROM "CallRecord"
        ORDER BY "timestamp" DESC
        LIMIT 50
      `;
      
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
