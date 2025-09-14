import { Router } from 'express';

const router = Router();

import { findEarliestAvailability } from './google-calendar';
import { bookEvent } from './book-calendar';

import { apiKeyAuth } from './auth';

router.post('/availability', apiKeyAuth, async (req, res) => {
  const calendars = req.body?.args?.calendars;

  if (!calendars || !Array.isArray(calendars) || calendars.length === 0) {
    return res.status(400).json({ error: 'Please provide a non-empty array of calendar IDs. Format: {"args": {"calendars": ["calendarId1", "calendarId2"]}}' });
  }
    try {
      const calendarIds = calendars.map((id: string) => ({ id }));
      const duration = req.body.args.duration
      const timezone = req.body.args.timezone;
      const timeMin = req.body.args.timeMin;
      const timeMax = req.body.args.timeMax;
      const bookingWindowStart = req.body.args.bookingWindowStart;
      const bookingWindowEnd = req.body.args.bookingWindowEnd;
      const intervalMinutes = req.body.duration;
      const numberOfSlots = req.body.numberOfSlots;

      const earliestSlot = await findEarliestAvailability(calendarIds, duration, timezone, bookingWindowStart, bookingWindowEnd, intervalMinutes, numberOfSlots, timeMin, timeMax);
      if (earliestSlot) {
        return res.json(earliestSlot);
      } else {
        return res.status(404).json({ message: 'No available slots found in the next 7 days.' });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to find earliest availability.' });
    }
});

router.post('/book', apiKeyAuth, async (req, res) => {
  const calendarId = req.body?.args?.calendarId;
  const start = req.body?.args?.start;
  const duration = req.body?.args?.duration;
  const timezone = req.body?.args?.timezone;
  const summary = req.body?.args?.summary;

  if (!calendarId || !start || !duration || !timezone || !summary) {
    return res.status(400).json({ error: 'Missing required parameters: calendarId, start, duration, timezone, summary' });
  }

  try {
    const event = await bookEvent(calendarId, start, duration, timezone, summary);
    return res.json(event);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to book event.' });
  }
});

export default router;
