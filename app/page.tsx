'use client';

import { Home as HomeIcon, CheckSquare, Bell, Calendar, Phone } from 'lucide-react';
import ModernPageHeader from './components/ModernPageHeader';
import FeatureCard from './components/FeatureCard';

export default function Home() {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <ModernPageHeader 
        title="VAPI Integration App"
        description="Comprehensive productivity suite with todos, reminders, calendar events, and caller ID services. Built with Next.js for modern web experiences."
        icon={HomeIcon}
        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <FeatureCard 
          title="Todos"
          description="Create, view, complete, and delete todo items. Stay organized with a powerful task management system."
          href="/todos"
          icon={CheckSquare}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        
        <FeatureCard 
          title="Reminders"
          description="Add, view, and delete reminders with customizable importance levels. Never miss important tasks again."
          href="/reminders"
          icon={Bell}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        
        <FeatureCard 
          title="Calendar"
          description="Schedule, view, and delete calendar events with precise start and end times. Manage your time effectively."
          href="/calendar"
          icon={Calendar}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        
        <FeatureCard 
          title="Caller ID"
          description="Look up caller information and manage call records with advanced Twilio integration and spam detection."
          href="/caller-id"
          icon={Phone}
          gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        />
      </div>
      
      {/* API Documentation Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        padding: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: '#f3f4f6',
            borderRadius: '50%',
            padding: '12px',
            marginRight: '16px'
          }}>
            <span style={{ fontSize: '24px' }}>🔗</span>
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: 0
          }}>API Endpoints</h3>
        </div>
        
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>This application provides the following RESTful API endpoints:</p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {[
            { endpoint: '/api/create_todo', description: 'Create a new todo item' },
            { endpoint: '/api/get_todos', description: 'Get all todo items' },
            { endpoint: '/api/complete_todo', description: 'Mark a todo as completed' },
            { endpoint: '/api/delete_todo', description: 'Delete a todo item' },
            { endpoint: '/api/add_reminder', description: 'Add a new reminder' },
            { endpoint: '/api/get_reminders', description: 'Get all reminders' },
            { endpoint: '/api/delete_reminder', description: 'Delete a reminder' },
            { endpoint: '/api/add_calendar_entry', description: 'Add calendar entry' },
            { endpoint: '/api/get_calendar_entries', description: 'Get calendar entries' },
            { endpoint: '/api/delete_calendar_entry', description: 'Delete calendar entry' },
            { endpoint: '/api/caller_id', description: 'Look up caller information' }
          ].map((api, index) => (
            <div key={index} style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <code style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#2563eb',
                backgroundColor: '#dbeafe',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'block',
                marginBottom: '8px'
              }}>{api.endpoint}</code>
              <p style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.4'
              }}>{api.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
