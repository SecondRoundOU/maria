'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertCircle, CheckCircle2, Clock, Calendar } from 'lucide-react';
import ModernPageHeader from '../components/ModernPageHeader';
import ModernForm, { FormInput, FormTextarea, FormSelect } from '../components/ModernForm';
import ModernItemCard from '../components/ModernItemCard';

interface TodoTask {
  id: string;
  title: string;
  status: 'notStarted' | 'inProgress' | 'completed' | 'waitingOnOthers' | 'deferred';
  importance: 'low' | 'normal' | 'high';
  body?: {
    content: string;
    contentType: string;
  };
  dueDateTime?: {
    dateTime: string;
    timeZone: string;
  };
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

export default function RemindersPage() {
  const [taskLists, setTaskLists] = useState<TodoTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [importance, setImportance] = useState<'low' | 'normal' | 'high'>('normal');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingLists, setFetchingLists] = useState(true);

  // Fetch task lists on mount
  useEffect(() => {
    fetchTaskLists();
  }, []);

  // Fetch tasks when a list is selected
  useEffect(() => {
    if (selectedListId) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [selectedListId]);

  const fetchTaskLists = async () => {
    setFetchingLists(true);
    try {
      const response = await fetch('/api/msft_todo?action=lists', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      if (data.success && data.lists) {
        setTaskLists(data.lists);
        // Auto-select the first list if available
        if (data.lists.length > 0 && !selectedListId) {
          setSelectedListId(data.lists[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching task lists:', error);
    } finally {
      setFetchingLists(false);
    }
  };

  const fetchTasks = async () => {
    if (!selectedListId) return;
    
    try {
      const response = await fetch(`/api/msft_todo?action=tasks&listId=${selectedListId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedListId) return;

    setLoading(true);
    try {
      const taskData: any = {
        listId: selectedListId,
        title,
        description,
        importance,
        status: 'notStarted'
      };

      if (dueDate) {
        taskData.dueDateTime = dueDate;
        taskData.timeZone = 'UTC';
      }

      const response = await fetch('/api/msft_todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setImportance('normal');
        setDueDate('');
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    if (!selectedListId) return;
    
    try {
      const response = await fetch('/api/msft_todo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listId: selectedListId,
          taskId,
          status: 'completed'
        })
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!selectedListId) return;
    
    try {
      const response = await fetch(`/api/msft_todo?listId=${selectedListId}&taskId=${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'inProgress':
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'inProgress':
        return '#3b82f6';
      case 'deferred':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return '#ef4444';
      case 'normal':
        return '#3b82f6';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (fetchingLists) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <ModernPageHeader 
          title="Reminders & Tasks"
          description="Loading your Microsoft To-Do lists..."
          icon={Bell}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <ModernPageHeader 
        title="Reminders & Tasks"
        description="Manage your Microsoft To-Do tasks with customizable importance levels and due dates. Stay on top of your responsibilities."
        icon={Bell}
        gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      />
      
      {taskLists.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '40px',
          textAlign: 'center'
        }}>
          <Bell style={{
            height: '48px',
            width: '48px',
            margin: '0 auto 16px',
            color: '#d1d5db'
          }} />
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>
            No task lists found
          </p>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>
            Please ensure your Microsoft account has task lists set up.
          </p>
        </div>
      ) : (
        <>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Select Task List
            </label>
            <select
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#111827',
                cursor: 'pointer'
              }}
            >
              {taskLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.displayName} {list.wellknownListName ? `(${list.wellknownListName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <ModernForm
            title="Add New Task"
            onSubmit={handleSubmit}
            submitText="Add Task"
            loading={loading}
          >
            <FormInput
              label="Task Title"
              type="text"
              value={title}
              onChange={setTitle}
              placeholder="Enter task title"
              required
            />
            
            <FormTextarea
              label="Description"
              value={description}
              onChange={setDescription}
              placeholder="Enter task description (optional)"
              rows={3}
            />

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '16px' 
            }}>
              <FormSelect
                label="Importance"
                value={importance}
                onChange={(value: string) => setImportance(value as 'low' | 'normal' | 'high')}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High' }
                ]}
              />

              <FormInput
                label="Due Date"
                type="datetime-local"
                value={dueDate}
                onChange={setDueDate}
                placeholder="Select due date (optional)"
              />
            </div>
          </ModernForm>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            padding: '24px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '20px'
            }}>
              Your Tasks ({tasks.length})
            </h3>
            
            {tasks.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280'
              }}>
                <Bell style={{
                  height: '48px',
                  width: '48px',
                  margin: '0 auto 16px',
                  color: '#d1d5db'
                }} />
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>No tasks yet</p>
                <p style={{ fontSize: '14px' }}>Add your first task using the form above!</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {tasks.map((task) => (
                  <ModernItemCard
                    key={task.id}
                    title={task.title}
                    description={task.body?.content}
                    metadata={[
                      {
                        label: 'Status',
                        value: task.status.replace(/([A-Z])/g, ' $1').trim(),
                        icon: getStatusIcon(task.status),
                        color: getStatusColor(task.status)
                      },
                      {
                        label: 'Importance',
                        value: task.importance.charAt(0).toUpperCase() + task.importance.slice(1),
                        icon: AlertCircle,
                        color: getImportanceColor(task.importance)
                      },
                      {
                        label: 'Due Date',
                        value: task.dueDateTime ? formatDate(task.dueDateTime.dateTime) : 'No due date',
                        icon: Calendar
                      }
                    ]}
                    onDelete={() => deleteTask(task.id)}
                    onAction={task.status !== 'completed' ? () => completeTask(task.id) : undefined}
                    actionText={task.status !== 'completed' ? 'Mark Complete' : undefined}
                    actionColor={task.status !== 'completed' ? '#10b981' : undefined}
                    gradient={task.status === 'completed'
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                      : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    }
                    completed={task.status === 'completed'}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
