import { google } from 'googleapis';
import { toZonedTime, toDate, format } from 'date-fns-tz';

import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\n/g, '\n');

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: privateKey,
  scopes: SCOPES,
});

const gcal = google.calendar({ version: 'v3', auth });

interface FreeBusyRequest {
  items: { id: string }[];
  timeMin: string;
  timeMax: string;
}

interface BookingWindow {
  hour: number
  minute: number
}

export async function checkAvailability(requestBody: FreeBusyRequest) {
  try {
    const response = await gcal.freebusy.query({ requestBody });
    return response.data.calendars;
  } catch (error) {
    console.error('Error checking free-busy times:', error);
    throw new Error('Failed to check calendar availability.');
  }
}

export async function findEarliestAvailability(
  calendarIds: { id: string }[],
  durationMinutes: number = 60,
  timezone: string = 'America/Denver',
  bookingWindowStart: BookingWindow = {hour: 8, minute: 0},
  bookingWindowEnd: BookingWindow = {hour: 17, minute: 0},
  intervalMinutes: number = 60
) {
  const intervalMilliseconds = intervalMinutes * 60 * 1000;
  const now = new Date(Math.ceil(new Date().getTime() / intervalMilliseconds) * intervalMilliseconds);
  const timeMin = now.toISOString();
  const timeMax = new Date(new Date().setUTCDate(now.getUTCDate() + 10)).toISOString(); // Search next 10 days

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

  const calendar = freeBusyResponse.data.calendars['xxxxxxxxxxxxxxxxx'].busy;
  console.log({calendar});
  if (calendar) {
    let startBooking = now 
    let endBooking = new Date(startBooking.getTime() + durationMinutes * 60000);

    for (const event of calendar) {
      if (event.start && endBooking.getTime() < new Date(event.start).getTime()) {
        // time is available! check if it's within the booking window
        const inWindow = checkBookingWindow(startBooking, endBooking, bookingWindowStart, bookingWindowEnd, timezone);
        if (inWindow) {
          return {
            startTime: format(startBooking, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone }),
            endTime: format(endBooking, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone })
          };
        }
        else {
          // move to the start of the next day/booking window in the users timezone
          // startBooking.setUTCDate(startBooking.getUTCDate() + 1);
          const zonedDate = toZonedTime(startBooking, timezone);
          zonedDate.setDate(zonedDate.getDate() + 1);

          const startBookingInZone = createDateInZone(zonedDate, bookingWindowStart, timezone);
          const endBookingInZone = new Date(startBookingInZone.getTime() + durationMinutes * 60000);

          // if time is availabe, great! 
          if (endBookingInZone.getTime() < toZonedTime(new Date(event.start), timezone).getTime()) {
            return {
              startTime: format(startBookingInZone, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone }),
              endTime: format(endBookingInZone, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone })
            };
          }
          // if not just continue to the next event
          else {
            startBooking = new Date(event.end!!)
            endBooking = new Date(startBooking.getTime() + durationMinutes * 60000);
          }
        }
      }
      else {
        // busy, move to the end of the current busy block
        startBooking = new Date(event.end!!)
        endBooking = new Date(startBooking.getTime() + durationMinutes * 60000);
      }
    }

    return null; // No slot found
  }
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