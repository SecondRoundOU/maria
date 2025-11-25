import { NextResponse } from 'next/server';
import { graphClient } from '@/app/utils/GraphClient';

interface MicrosoftTodoTask {
  id?: string;
  title: string;
  status?: 'notStarted' | 'inProgress' | 'completed' | 'waitingOnOthers' | 'deferred';
  importance?: 'low' | 'normal' | 'high';
  body?: {
    content: string;
    contentType: 'text' | 'html';
  };
  dueDateTime?: {
    dateTime: string;
    timeZone: string;
  };
  reminderDateTime?: {
    dateTime: string;
    timeZone: string;
  };
  isReminderOn?: boolean;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
}

interface TodoTaskList {
  id: string;
  displayName: string;
  isOwner: boolean;
  isShared: boolean;
  wellknownListName?: string;
}

/**
 * GET /api/msft_todo
 * Query params:
 * - action: 'lists' | 'tasks' (default: 'lists')
 * - listId: required if action='tasks'
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'lists';
    const listId = searchParams.get('listId');
    const userEmail = searchParams.get('userEmail') || process.env.NEXT_USER_EMAIL;

    if (!userEmail) {
      return NextResponse.json({ 
        error: 'User email is required. Please set NEXT_USER_EMAIL in environment variables.' 
      }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    if (action === 'lists') {
      // Get all task lists
      const response = await graphClient
        .api(`/users/${userEmail}/todo/lists`)
        .get();

      return NextResponse.json({
        success: true,
        lists: response.value as TodoTaskList[]
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    } else if (action === 'tasks') {
      if (!listId) {
        return NextResponse.json({ 
          error: 'listId is required when action=tasks' 
        }, {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        });
      }

      // Get tasks from a specific list
      const response = await graphClient
        .api(`/users/${userEmail}/todo/lists/${listId}/tasks`)
        .get();

      return NextResponse.json({
        success: true,
        tasks: response.value as MicrosoftTodoTask[]
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    } else {
      return NextResponse.json({ 
        error: 'Invalid action. Use "lists" or "tasks"' 
      }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  } catch (error) {
    console.error('Error fetching Microsoft To-Do data:', error);
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

/**
 * POST /api/msft_todo
 * Creates a new task in a specified list
 * Body: { listId, title, status, importance, dueDateTime, body, isReminderOn, reminderDateTime }
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
    const body = await request.json();
    console.log('Received POST body:', JSON.stringify(body, null, 2));
    
    // Handle VAPI nested structure
    let listId: string;
    let taskData: Partial<MicrosoftTodoTask>;
    let userEmail: string;
    
    if (body.message?.toolWithToolCallList?.[0]?.toolCall?.function?.arguments) {
      // VAPI format
      const args = body.message.toolWithToolCallList[0].toolCall.function.arguments;
      listId = args.listId;
      userEmail = args.userEmail || process.env.NEXT_USER_EMAIL || '';
      taskData = {
        title: args.title,
        status: args.status || 'notStarted',
        importance: args.importance || 'normal',
      };
      
      if (args.description) {
        taskData.body = {
          content: args.description,
          contentType: 'text'
        };
      }
      
      if (args.dueDateTime) {
        taskData.dueDateTime = {
          dateTime: args.dueDateTime,
          timeZone: args.timeZone || 'UTC'
        };
      }
      
      if (args.isReminderOn) {
        taskData.isReminderOn = true;
        if (args.reminderDateTime) {
          taskData.reminderDateTime = {
            dateTime: args.reminderDateTime,
            timeZone: args.timeZone || 'UTC'
          };
        }
      }
    } else {
      // Direct format (from web UI)
      listId = body.listId;
      userEmail = body.userEmail || process.env.NEXT_USER_EMAIL || '';
      taskData = {
        title: body.title,
        status: body.status || 'notStarted',
        importance: body.importance || 'normal',
      };
      
      if (body.description) {
        taskData.body = {
          content: body.description,
          contentType: 'text'
        };
      }
      
      if (body.dueDateTime) {
        taskData.dueDateTime = typeof body.dueDateTime === 'string' 
          ? { dateTime: body.dueDateTime, timeZone: body.timeZone || 'UTC' }
          : body.dueDateTime;
      }
      
      if (body.isReminderOn) {
        taskData.isReminderOn = true;
        if (body.reminderDateTime) {
          taskData.reminderDateTime = typeof body.reminderDateTime === 'string'
            ? { dateTime: body.reminderDateTime, timeZone: body.timeZone || 'UTC' }
            : body.reminderDateTime;
        }
      }
    }

    if (!userEmail) {
      console.log('UserEmail validation failed.');
      return NextResponse.json({ error: 'User email is required. Please set NEXT_USER_EMAIL in environment variables.' }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    if (!listId) {
      console.log('ListId validation failed. ListId value:', listId);
      return NextResponse.json({ error: 'listId is required' }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    if (!taskData.title) {
      console.log('Title validation failed. Title value:', taskData.title);
      return NextResponse.json({ error: 'Title is required' }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Create the task via Microsoft Graph API
    const response = await graphClient
      .api(`/users/${userEmail}/todo/lists/${listId}/tasks`)
      .post(taskData);

    return NextResponse.json({
      success: true,
      task: response as MicrosoftTodoTask
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error creating Microsoft To-Do task:', error);
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

/**
 * PUT /api/msft_todo
 * Updates an existing task
 * Body: { listId, taskId, title, status, importance, dueDateTime, body, isReminderOn, reminderDateTime }
 */
export async function PUT(request: Request) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const body = await request.json();
    console.log('Received PUT body:', JSON.stringify(body, null, 2));
    
    const listId = body.listId;
    const taskId = body.taskId;
    const userEmail = body.userEmail || process.env.NEXT_USER_EMAIL;

    if (!userEmail) {
      return NextResponse.json({ 
        error: 'User email is required. Please set NEXT_USER_EMAIL in environment variables.' 
      }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    if (!listId || !taskId) {
      return NextResponse.json({ 
        error: 'listId and taskId are required' 
      }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Build update object
    const updateData: Partial<MicrosoftTodoTask> = {};
    
    if (body.title) updateData.title = body.title;
    if (body.status) updateData.status = body.status;
    if (body.importance) updateData.importance = body.importance;
    
    if (body.description !== undefined) {
      updateData.body = body.description 
        ? { content: body.description, contentType: 'text' }
        : { content: '', contentType: 'text' };
    }
    
    if (body.dueDateTime !== undefined) {
      updateData.dueDateTime = body.dueDateTime
        ? (typeof body.dueDateTime === 'string' 
            ? { dateTime: body.dueDateTime, timeZone: body.timeZone || 'UTC' }
            : body.dueDateTime)
        : null as any;
    }
    
    if (body.isReminderOn !== undefined) {
      updateData.isReminderOn = body.isReminderOn;
      if (body.isReminderOn && body.reminderDateTime) {
        updateData.reminderDateTime = typeof body.reminderDateTime === 'string'
          ? { dateTime: body.reminderDateTime, timeZone: body.timeZone || 'UTC' }
          : body.reminderDateTime;
      }
    }

    // Update the task via Microsoft Graph API
    const response = await graphClient
      .api(`/users/${userEmail}/todo/lists/${listId}/tasks/${taskId}`)
      .patch(updateData);

    return NextResponse.json({
      success: true,
      task: response as MicrosoftTodoTask
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error updating Microsoft To-Do task:', error);
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

/**
 * DELETE /api/msft_todo
 * Query params:
 * - listId: required
 * - taskId: required
 */
export async function DELETE(request: Request) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');
    const taskId = searchParams.get('taskId');
    const userEmail = searchParams.get('userEmail') || process.env.NEXT_USER_EMAIL;

    if (!userEmail) {
      return NextResponse.json({ 
        error: 'User email is required. Please set NEXT_USER_EMAIL in environment variables.' 
      }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    if (!listId || !taskId) {
      return NextResponse.json({ 
        error: 'listId and taskId are required' 
      }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Delete the task via Microsoft Graph API
    await graphClient
      .api(`/users/${userEmail}/todo/lists/${listId}/tasks/${taskId}`)
      .delete();

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error deleting Microsoft To-Do task:', error);
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
