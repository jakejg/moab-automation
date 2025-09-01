import { calendar_v3, google } from 'googleapis';
import { toZonedTime, toDate, format } from 'date-fns-tz';
import Schema$TimePeriod = calendar_v3.Schema$TimePeriod;

import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

const privateKey = process.env.GOOGLE_PRIVATE_KEY_CALENDAR?.replace(/\\n/g, '\n');

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
  const zonedStart = toZonedTime(startBooking, timezone);
  const zonedEnd = toZonedTime(endBooking, timezone);

  const startTime = zonedStart.getHours() * 100 + zonedStart.getMinutes();
  let endTime = zonedEnd.getHours() * 100 + zonedEnd.getMinutes();

  // If a slot ends exactly at midnight, it's part of the previous day's window.
  // Treat it as 2400 for comparison purposes.
  if (endTime === 0) {
    endTime = 2400;
  }

  const windowStartTime = bookingWindowStart.hour * 100 + bookingWindowStart.minute;
  const windowEndTime = bookingWindowEnd.hour * 100 + bookingWindowEnd.minute;

  return startTime >= windowStartTime && endTime <= windowEndTime;
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
  const zonedTimeMin = toZonedTime(timeMin, timezone);
  const zonedTimeMax = toZonedTime(timeMax, timezone);

  let slotStart = zonedTimeMin;
  const endTimeLimit = zonedTimeMax;
  const durationMilliseconds = durationMinutes * 60000;
  const intervalMilliseconds = intervalMinutes * 60000;

  while (slotStart < endTimeLimit) {
    const slotEnd = new Date(slotStart.getTime() + durationMilliseconds);

    if (slotEnd > endTimeLimit) {
      return null; // Slot extends beyond the search limit
    }

    const isBusy = busySlots.some(busy => {
      const busyStart = toZonedTime(new Date(busy.start!), timezone);
      const busyEnd = toZonedTime(new Date(busy.end!), timezone);
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
 