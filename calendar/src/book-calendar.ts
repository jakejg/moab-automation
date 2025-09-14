import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const privateKey = process.env.GOOGLE_PRIVATE_KEY_CALENDAR?.replace(/\\n/g, '\n');

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_CALENDAR_EMAIL,
  key: privateKey,
  scopes: SCOPES,
});

const gcal = google.calendar({ version: 'v3', auth });

export async function bookEvent(calendarId: string, start: string, duration: number, timezone: string, summary: string) {
  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const event = {
    summary,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: timezone,
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: timezone,
    },
  };

  try {

    const response = await gcal.events.insert({
      calendarId: calendarId,
      requestBody: event,
    });

    return response.data;
  } catch (error) {
    console.error('Error booking event:', JSON.stringify(error, null, 2));
    throw error;
  }
}
