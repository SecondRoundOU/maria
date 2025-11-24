'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import ModernPageHeader from '../components/ModernPageHeader';
import ModernForm, { FormInput, FormTextarea } from '../components/ModernForm';
import ModernItemCard from '../components/ModernItemCard';

interface CalendarEvent {
  id: string;
  subject: string;
  start: string;
  end: string;
  timeZone: string;
  location: string;
  isAllDay: boolean;
  organizer: string;
  attendees: Array<{
    email: string;
    name: string;
    status: string;
  }>;
  bodyPreview: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventFrom, setEventFrom] = useState('');
  const [eventTo, setEventTo] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/checkAvailibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days: 30 // Fetch events for next 30 days
        })
      });

      const data = await response.json();
      if (data.success && data.events) {
        setEvents(data.events);
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
      const response = await fetch('/api/addCalendarEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: title,
          description,
          startDateTime: eventFrom,
          endDateTime: eventTo,
          location
        })
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setEventFrom('');
        setEventTo('');
        setLocation('');
        fetchEvents();
      }
    } catch (error) {
      console.error('Error adding calendar event:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch('/api/deleteCalendarEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: id
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
        title="Microsoft Calendar"
        description="View and manage your Microsoft 365 calendar events. Create new meetings, check availability, and stay synchronized with your Outlook calendar."
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
        
        <FormInput
          label="Location (Optional)"
          type="text"
          value={location}
          onChange={setLocation}
          placeholder="Enter event location"
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
                title={event.subject}
                description={event.bodyPreview || 'No description'}
                metadata={[
                  {
                    label: 'Starts',
                    value: formatDateTime(event.start),
                    icon: Clock
                  },
                  {
                    label: 'Ends',
                    value: formatDateTime(event.end),
                    icon: Clock
                  },
                  ...(event.location ? [{
                    label: 'Location',
                    value: event.location,
                    icon: MapPin
                  }] : []),
                  ...(event.organizer ? [{
                    label: 'Organizer',
                    value: event.organizer,
                    icon: Calendar
                  }] : [])
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
