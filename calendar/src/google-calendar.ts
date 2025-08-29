import { calendar_v3, google } from 'googleapis';
import { toZonedTime, toDate, format } from 'date-fns-tz';
import Schema$TimePeriod = calendar_v3.Schema$TimePeriod;

import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

const privateKey = process.env.GOOGLE_PRIVATE_KEY_CALENDAR?.replace(/\n/g, '\n');

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_CALENDAR_EMAIL,
  key: privateKey,
  scopes: SCOPES,
});


const gcal = google.calendar({ version: 'v3', auth });

interface BookingWindow {
  hour: number
  minute: number
}

export async function findEarliestAvailability(
  calendarIds: { id: string }[],
  durationMinutes: number = 60,
  timezone: string = 'America/Denver',
  bookingWindowStart: BookingWindow = {hour: 8, minute: 0},
  bookingWindowEnd: BookingWindow = {hour: 17, minute: 0},
  intervalMinutes: number = 60,
  numberOfSlots: number = 2, // Number of slots to find for each calendar
  timeMin: string,
  timeMax: string

) {

    const intervalMilliseconds = intervalMinutes * 60 * 1000;
    const now = new Date(Math.ceil(new Date().getTime() / intervalMilliseconds) * intervalMilliseconds);
    if (timeMin == null) {
      timeMin = now.toISOString();
    }
    
    if (timeMax == null) {
      timeMax = new Date(new Date().setUTCDate(now.getUTCDate() + 10)).toISOString(); // Default next 10 days
    }

    if (new Date(timeMin).getTime() > new Date(timeMax).getTime()){
      throw new Error('timeMin must be before timeMax');
    }
   

  const freeBusyResponse = await gcal.freebusy.query({
    requestBody: {
      items: calendarIds,
      timeMin,
      timeMax,
    },
  });

  if (!freeBusyResponse.data.calendars) {
    return null;
  }

  const calendars = Object.entries(freeBusyResponse.data.calendars).map(([calendarId, busyData]) => {
    return {
      calendarId: calendarId,
      busySlots: busyData.busy,
    };
  });

  const openSlots: { startTime: string; endTime: string, calendarId: string }[] = [];

  for (const calendar of calendars) {

    const { busySlots } = calendar;

    if (busySlots) {
      let startTime = timeMin;

      for (let i = 0; i < numberOfSlots; i++) {
          const openSlot = getEarliestSlot(busySlots, durationMinutes, bookingWindowStart, bookingWindowEnd, timezone, startTime, timeMax, intervalMinutes);
          if (openSlot) {
            openSlots.push({ ...openSlot, calendarId: calendar.calendarId });
            startTime = openSlot.endTime;
          }
        }
      }
    }

  openSlots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  return openSlots;
}


function checkBookingWindow(startBooking: Date, endBooking: Date, bookingWindowStart: BookingWindow, bookingWindowEnd: BookingWindow, timezone: string) {
  const windowStartInZone = createDateInZone(startBooking, bookingWindowStart, timezone);
  const windowEndInZone = createDateInZone(startBooking, bookingWindowEnd, timezone)

  // is the start time before the window start in the current users timezone?
  if (startBooking.getTime() < windowStartInZone.getTime()) {
    return false;
  }
  // is the end time after the window end in the current users timezone?
  if (endBooking.getTime() > windowEndInZone.getTime()) {
    return false;
  }

  return true;
}

function createDateInZone(date: Date, time: BookingWindow, timezone: string): Date {
  const zonedDay = toZonedTime(date, timezone);
  const year = zonedDay.getFullYear();
  const month = (zonedDay.getMonth() + 1).toString().padStart(2, '0');
  const day = zonedDay.getDate().toString().padStart(2, '0');
  const dateString = `${year}-${month}-${day}T${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}:00`;
  return toDate(dateString, { timeZone: timezone });
}

function getEarliestSlot(
  busySlots: Schema$TimePeriod[],
  durationMinutes: number,
  bookingWindowStart: BookingWindow,
  bookingWindowEnd: BookingWindow,
  timezone: string,
  timeMin: string,
  timeMax: string,
  intervalMinutes: number
): { startTime: string; endTime: string } | null {
  let slotStart = toDate(timeMin);
  const endTimeLimit = toDate(timeMax);
  const durationMilliseconds = durationMinutes * 60000;
  const intervalMilliseconds = intervalMinutes * 60000;
 
  while (slotStart < endTimeLimit) {
    const slotEnd = new Date(slotStart.getTime() + durationMilliseconds);

    if (slotEnd > endTimeLimit) {
      return null; // Slot extends beyond the search limit
    }

    const isBusy = busySlots.some(busy => {
      const busyStart = new Date(busy.start!);
      const busyEnd = new Date(busy.end!);
      // Check for overlap: (StartA < EndB) and (EndA > StartB)
      return slotStart < busyEnd && slotEnd > busyStart;
    });

    if (!isBusy) {

      const isInWindow = checkBookingWindow(
        slotStart,
        slotEnd,
        bookingWindowStart,
        bookingWindowEnd,
        timezone
      );

      if (isInWindow) {
        return {
          startTime: format(slotStart, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone }),
          endTime: format(slotEnd, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone })
        };
      }
    }

    // Move to the next time slot
    slotStart = new Date(slotStart.getTime() + intervalMilliseconds);
  }

  return null; // No available slot found
}
 