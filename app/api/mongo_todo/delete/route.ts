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

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id }: { id: string } = body;

    if (!id) {
      return NextResponse.json({ error: 'Todo ID is required' }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const client = await clientPromise;
    const database = client.db('vapi_integration');
    const collection = database.collection<MongoTodo>('todos');

    // Delete the todo
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Todo not found' }, {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Todo deleted successfully'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error deleting MongoDB todo:', error);
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
