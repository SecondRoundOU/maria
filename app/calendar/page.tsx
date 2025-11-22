'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import ModernPageHeader from '../components/ModernPageHeader';
import ModernForm, { FormInput, FormTextarea } from '../components/ModernForm';
import ModernItemCard from '../components/ModernItemCard';

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  event_from: string;
  event_to: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventFrom, setEventFrom] = useState('');
  const [eventTo, setEventTo] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/get_calendar_entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            toolCalls: [
              {
                id: 'fetch-calendar-entries-' + Date.now(),
                function: {
                  name: 'getCalendarEntries',
                  arguments: {}
                }
              }
            ]
          }
        })
      });

      const data = await response.json();
      if (data.results && data.results[0] && data.results[0].result) {
        setEvents(data.results[0].result);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventFrom || !eventTo) return;

    setLoading(true);
    try {
      const response = await fetch('/api/add_calendar_entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            toolCalls: [
              {
                id: 'add-calendar-entry-' + Date.now(),
                function: {
                  name: 'addCalendarEntry',
                  arguments: {
                    title,
                    description,
                    event_from: eventFrom,
                    event_to: eventTo
                  }
                }
              }
            ]
          }
        })
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setEventFrom('');
        setEventTo('');
        fetchEvents();
      }
    } catch (error) {
      console.error('Error adding calendar event:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      const response = await fetch('/api/delete_calendar_entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            toolCalls: [
              {
                id: 'delete-calendar-entry-' + Date.now(),
                function: {
                  name: 'deleteCalendarEntry',
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
        fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting calendar event:', error);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <ModernPageHeader 
        title="Calendar Events"
        description="Schedule, view, and manage your calendar events with precise start and end times. Stay organized and never miss important appointments."
        icon={Calendar}
        gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
      />
      
      <ModernForm
        title="Add New Calendar Event"
        onSubmit={handleSubmit}
        submitText="Add Event"
        loading={loading}
      >
        <FormInput
          label="Event Title"
          type="text"
          value={title}
          onChange={setTitle}
          placeholder="Enter event title"
          required
        />
        
        <FormTextarea
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Enter event description (optional)"
          rows={3}
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormInput
            label="Start Date & Time"
            type="datetime-local"
            value={eventFrom}
            onChange={setEventFrom}
            required
          />
          
          <FormInput
            label="End Date & Time"
            type="datetime-local"
            value={eventTo}
            onChange={setEventTo}
            required
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
          Your Calendar Events ({events.length})
        </h3>
        
        {events.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6b7280'
          }}>
            <Calendar style={{
              height: '48px',
              width: '48px',
              margin: '0 auto 16px',
              color: '#d1d5db'
            }} />
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No events scheduled yet</p>
            <p style={{ fontSize: '14px' }}>Add your first event using the form above!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {events.map((event) => (
              <ModernItemCard
                key={event.id}
                title={event.title}
                description={event.description}
                metadata={[
                  {
                    label: 'Starts',
                    value: formatDateTime(event.event_from),
                    icon: Clock
                  },
                  {
                    label: 'Ends',
                    value: formatDateTime(event.event_to),
                    icon: Clock
                  }
                ]}
                onDelete={() => deleteEvent(event.id)}
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
