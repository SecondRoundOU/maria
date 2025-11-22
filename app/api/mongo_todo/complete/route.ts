import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

interface MongoTodo {
  _id?: ObjectId;
  title: string;
  description?: string;
  completed?: boolean;
  createdAt?: Date;
}

export async function PATCH(request: Request) {
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

    // Connect to MongoDB
    await client.connect();

    const database = client.db('vapi_integration');
    const collection = database.collection<MongoTodo>('todos');

    // Update the todo to mark it as completed
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { completed: true } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Todo not found' }, {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Todo marked as completed'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error completing MongoDB todo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } finally {
    // Close the connection
    await client.close();
  }
}
