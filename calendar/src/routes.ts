import { Router } from 'express';

const router = Router();

import { checkAvailability, findEarliestAvailability } from './google-calendar';

import { apiKeyAuth } from './auth';

router.post('/availability', apiKeyAuth, async (req, res) => {
  const { calendars, startTime, endTime } = req.body;

  if (!calendars || !Array.isArray(calendars) || calendars.length === 0) {
    return res.status(400).json({ error: 'Please provide a non-empty array of calendar IDs.' });
  }

  if (startTime && endTime) {
    try {
      const requestBody = {
        items: calendars.map((id: string) => ({ id })),
        timeMin: new Date(startTime).toISOString(),
        timeMax: new Date(endTime).toISOString(),
      };
      const result = await checkAvailability(requestBody);
      let isBusy = false;
      if (result) {
        isBusy = Object.values(result).some(cal => cal.busy && cal.busy.length > 0);
      }
      return res.json({ available: !isBusy });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to check calendar availability.' });
    }
  } else {
    try {
      const calendarIds = calendars.map((id: string) => ({ id }));
      const duration = req.body.duration
      const timezone = req.body.timezone;
      const earliestSlot = await findEarliestAvailability(calendarIds, duration, timezone);

      if (earliestSlot) {
        return res.json(earliestSlot);
      } else {
        return res.status(404).json({ message: 'No available slots found in the next 7 days.' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to find earliest availability.' });
    }
  }
});

export default router;
