'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import ModernPageHeader from '../components/ModernPageHeader';
import ModernForm, { FormInput, FormTextarea } from '../components/ModernForm';
import ModernItemCard from '../components/ModernItemCard';

interface Reminder {
  id: number;
  reminder_text: string;
  importance: string;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderText, setReminderText] = useState('');
  const [importance, setImportance] = useState('medium');
  const [loading, setLoading] = useState(false);

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/get_reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            toolCalls: [
              {
                id: 'fetch-reminders-' + Date.now(),
                function: {
                  name: 'getReminders',
                  arguments: {}
                }
              }
            ]
          }
        })
      });

      const data = await response.json();
      if (data.results && data.results[0] && data.results[0].result) {
        setReminders(data.results[0].result);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderText) return;

    setLoading(true);
    try {
      const response = await fetch('/api/add_reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            toolCalls: [
              {
                id: 'add-reminder-' + Date.now(),
                function: {
                  name: 'addReminder',
                  arguments: {
                    reminder_text: reminderText,
                    importance
                  }
                }
              }
            ]
          }
        })
      });

      if (response.ok) {
        setReminderText('');
        setImportance('medium');
        fetchReminders();
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReminder = async (id: number) => {
    try {
      const response = await fetch('/api/delete_reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            toolCalls: [
              {
                id: 'delete-reminder-' + Date.now(),
                function: {
                  name: 'deleteReminder',
                  arguments: {
                    id
                  }
                }
              }
            ]
          }
        })
      });

      if (response.ok) {
        fetchReminders();
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const getImportanceGradient = (importance: string) => {
    switch (importance.toLowerCase()) {
      case 'high':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'medium':
        return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'low':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      default:
        return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance.toLowerCase()) {
      case 'high':
        return AlertTriangle;
      case 'medium':
        return Info;
      case 'low':
        return CheckCircle;
      default:
        return Bell;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <ModernPageHeader 
        title="Reminders"
        description="Add, view, and manage reminders with customizable importance levels. Never miss important tasks again with organized priority-based reminders."
        icon={Bell}
        gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      />
      
      <ModernForm
        title="Add New Reminder"
        onSubmit={handleSubmit}
        submitText="Add Reminder"
        loading={loading}
      >
        <FormTextarea
          label="Reminder Text"
          value={reminderText}
          onChange={setReminderText}
          placeholder="Enter your reminder text"
          rows={2}
        />
        
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Importance Level <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={importance}
            onChange={(e) => setImportance(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              transition: 'border-color 0.2s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
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
          Your Reminders ({reminders.length})
        </h3>
        
        {reminders.length === 0 ? (
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
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No reminders yet</p>
            <p style={{ fontSize: '14px' }}>Add your first reminder using the form above!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {reminders.map((reminder) => {
              const ImportanceIcon = getImportanceIcon(reminder.importance);
              return (
                <ModernItemCard
                  key={reminder.id}
                  title={reminder.reminder_text}
                  metadata={[
                    {
                      label: 'Priority',
                      value: `${reminder.importance.charAt(0).toUpperCase() + reminder.importance.slice(1)} Priority`,
                      icon: ImportanceIcon
                    }
                  ]}
                  onDelete={() => deleteReminder(reminder.id)}
                  gradient={getImportanceGradient(reminder.importance)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
