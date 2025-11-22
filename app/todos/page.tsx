'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Square, Check } from 'lucide-react';
import ModernPageHeader from '../components/ModernPageHeader';
import ModernForm, { FormInput, FormTextarea } from '../components/ModernForm';
import ModernItemCard from '../components/ModernItemCard';

interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed?: boolean;
  createdAt?: string;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/mongo_todo', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      if (data.success && data.todos) {
        setTodos(data.todos);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);
    try {
      const response = await fetch('/api/mongo_todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description
        })
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        fetchTodos();
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTodo = async (id: string) => {
    try {
      const response = await fetch('/api/mongo_todo/complete', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id
        })
      });

      if (response.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Error completing todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch('/api/mongo_todo/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id
        })
      });

      if (response.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <ModernPageHeader 
        title="Todo Management"
        description="Create, view, complete, and delete todo items. Stay organized with a powerful task management system that helps you track your progress."
        icon={CheckSquare}
        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      />
      
      <ModernForm
        title="Add New Todo"
        onSubmit={handleSubmit}
        submitText="Add Todo"
        loading={loading}
      >
        <FormInput
          label="Todo Title"
          type="text"
          value={title}
          onChange={setTitle}
          placeholder="Enter todo title"
          required
        />
        
        <FormTextarea
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Enter todo description (optional)"
          rows={3}
        />
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
          Your Todos ({todos.length})
        </h3>
        
        {todos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6b7280'
          }}>
            <CheckSquare style={{
              height: '48px',
              width: '48px',
              margin: '0 auto 16px',
              color: '#d1d5db'
            }} />
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No todos yet</p>
            <p style={{ fontSize: '14px' }}>Add your first todo using the form above!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {todos.map((todo) => (
              <ModernItemCard
                key={todo._id}
                title={todo.title}
                description={todo.description}
                metadata={[
                  {
                    label: 'Status',
                    value: todo.completed ? 'Completed' : 'Pending',
                    icon: todo.completed ? Check : Square
                  }
                ]}
                onDelete={() => deleteTodo(todo._id)}
                onAction={!todo.completed ? () => completeTodo(todo._id) : undefined}
                actionText={!todo.completed ? 'Mark Complete' : undefined}
                actionColor={!todo.completed ? '#10b981' : undefined}
                gradient={todo.completed 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }
                completed={todo.completed}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
