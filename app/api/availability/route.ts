import { graphClient } from '@/app/utils/GraphClient';
import { NextResponse } from 'next/server';
import { addDays, addHours, format, parse, parseISO, set } from 'date-fns';

// Define working hours (9 AM to 5 PM)
const WORKING_HOURS_START = 9;
const WORKING_HOURS_END = 17;
const MEETING_DURATION_MINUTES = 30;

export async function POST(request: Request) {
  try {
    const { attendeeEmail, startDate } = await request.json();
    
    if (!attendeeEmail) {
      return NextResponse.json(
        { error: 'Attendee email is required' },
        { status: 400 }
      );
    }
    
    // The user email address (using application permissions)
    const userEmail = process.env.NEXT_USER_EMAIL;
    
    // Set start and end times for availability check (today and next 3 days)
    const today = startDate ? new Date(startDate) : new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = addDays(today, 3);
    endDate.setHours(23, 59, 59, 999);
    
    // Format dates for Graph API
    const startDateTime = today.toISOString();
    const endDateTime = endDate.toISOString();
    
    console.log(`Checking availability from ${startDateTime} to ${endDateTime}`);
    console.log(`Attendees: ${userEmail}, ${attendeeEmail}`);
    
    // Get free/busy information
    const freeBusyResponse = await graphClient
      .api('/users/' + userEmail + '/calendar/getSchedule')
      .post({
        schedules: [userEmail, attendeeEmail],
        startTime: {
          dateTime: startDateTime,
          timeZone: 'UTC'
        },
        endTime: {
          dateTime: endDateTime,
          timeZone: 'UTC'
        },
        availabilityViewInterval: MEETING_DURATION_MINUTES
      });
    
    if (!freeBusyResponse.value || freeBusyResponse.value.length < 2) {
      return NextResponse.json(
        { error: 'Failed to retrieve availability information' },
        { status: 500 }
      );
    }
    
    // Extract availability information
    const organizerSchedule = freeBusyResponse.value[0];
    const attendeeSchedule = freeBusyResponse.value[1];
    
    if (!organizerSchedule.availabilityView || !attendeeSchedule.availabilityView) {
      return NextResponse.json(
        { error: 'Availability information is incomplete' },
        { status: 500 }
      );
    }
    
    // Find the next available time slot
    const nextAvailableSlot = findNextAvailableTimeSlot(
      organizerSchedule.availabilityView,
      attendeeSchedule.availabilityView,
      organizerSchedule.scheduleItems || [],
      attendeeSchedule.scheduleItems || [],
      today,
      MEETING_DURATION_MINUTES
    );
    
    if (!nextAvailableSlot) {
      return NextResponse.json(
        { error: 'No available time slots found in the next 3 days' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      nextAvailableSlot
    });
    
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}

function findNextAvailableTimeSlot(
  organizerAvailability: string,
  attendeeAvailability: string,
  organizerScheduleItems: any[],
  attendeeScheduleItems: any[],
  startDate: Date,
  intervalMinutes: number
) {
  // Start from current time, rounded up to the next interval
  const now = new Date();
  const currentDate = new Date(Math.max(now.getTime(), startDate.getTime()));
  
  // Adjust to the next interval if needed
  const minutes = currentDate.getMinutes();
  const remainder = minutes % intervalMinutes;
  if (remainder > 0) {
    currentDate.setMinutes(minutes + (intervalMinutes - remainder));
  }
  
  // Check each day for the next 3 days
  for (let day = 0; day < 3; day++) {
    const checkDate = addDays(startDate, day);
    
    // Only check during working hours (9 AM to 5 PM)
    for (let hour = WORKING_HOURS_START; hour < WORKING_HOURS_END; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const timeSlot = new Date(checkDate);
        timeSlot.setHours(hour, minute, 0, 0);
        
        // Skip times in the past
        if (timeSlot < currentDate) {
          continue;
        }
        
        // Calculate the index in the availability view
        const startTimeIndex = Math.floor(
          (timeSlot.getTime() - startDate.getTime()) / (intervalMinutes * 60 * 1000)
        );
        
        // Check if both parties are available at this time slot
        if (
          startTimeIndex >= 0 &&
          startTimeIndex < organizerAvailability.length &&
          organizerAvailability[startTimeIndex] === '0' &&
          attendeeAvailability[startTimeIndex] === '0'
        ) {
          // Found an available slot
          const endTimeSlot = addMinutes(timeSlot, intervalMinutes);
          
          return {
            start: timeSlot.toISOString(),
            end: endTimeSlot.toISOString(),
            formattedStart: format(timeSlot, 'yyyy-MM-dd\'T\'HH:mm:ss'),
            formattedEnd: format(endTimeSlot, 'yyyy-MM-dd\'T\'HH:mm:ss'),
            displayDate: format(timeSlot, 'EEEE, MMMM d, yyyy'),
            displayTime: format(timeSlot, 'h:mm a') + ' - ' + format(endTimeSlot, 'h:mm a')
          };
        }
      }
    }
  }
  
  // No available slot found
  return null;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}
