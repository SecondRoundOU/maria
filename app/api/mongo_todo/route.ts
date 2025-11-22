import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

interface MongoTodo {
  _id?: ObjectId;
  title: string;
  description?: string;
  completed?: boolean;
  createdAt?: Date;
}

export async function GET() {
  try {
    const client = await clientPromise;
    const database = client.db('vapi_integration');
    const collection = database.collection<MongoTodo>('todos');

    // Fetch all todos, sorted by creation date (newest first)
    const todos = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      todos: todos
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error fetching MongoDB todos:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

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
    const body = await request.json();
    const { title, description = '' }: { title: string; description?: string } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const client = await clientPromise;
    const database = client.db('vapi_integration');
    const collection = database.collection<MongoTodo>('todos');

    // Create the todo document
    const todo: MongoTodo = {
      title,
      description,
      completed: false,
      createdAt: new Date()
    };

    // Insert the document
    const result = await collection.insertOne(todo);

    return NextResponse.json({
      success: true,
      todo: {
        _id: result.insertedId,
        ...todo
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error creating MongoDB todo:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
