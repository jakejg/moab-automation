import { Router } from 'express';

const router = Router();

import { findEarliestAvailability } from './google-calendar';

import { apiKeyAuth } from './auth';

router.post('/availability', apiKeyAuth, async (req, res) => {
  const { calendars, startTime, endTime } = req.body;

  if (!calendars || !Array.isArray(calendars) || calendars.length === 0) {
    return res.status(400).json({ error: 'Please provide a non-empty array of calendar IDs.' });
  }
    try {
      const calendarIds = calendars.map((id: string) => ({ id }));
      const duration = req.body.duration
      const timezone = req.body.timezone;
      const timeMin = req.body.timeMin;
      const timeMax = req.body.timeMax;
      const bookingWindowStart = req.body.bookingWindowStart;
      const bookingWindowEnd = req.body.bookingWindowEnd;
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

export default router;
