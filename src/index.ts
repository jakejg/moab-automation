import express from 'express';
import bodyParser from 'body-parser';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import { getSheetData, removePhoneNumber } from './sheets';
import { loadGoogleSecrets } from './gcloud-secrets';

loadGoogleSecrets();

const app = express();
const port = process.env.PORT || 3000;

// Parse incoming POST requests
app.use(bodyParser.urlencoded({ extended: false }));

// Webhook endpoint for incoming SMS
app.post('/sms', async (req, res) => {
  try {
    const twiml = new MessagingResponse();
    const incomingMsg = req.body.Body.trim().toLowerCase();
    const fromPhoneNumber = req.body.From;

    if (incomingMsg === 'stopdaily') {
      try {
        const removed = await removePhoneNumber(fromPhoneNumber);
        if (removed) {
          twiml.message('You have been unsubscribed from daily lunch notifications.');
        } else {
          twiml.message('You are not currently subscribed to daily lunch notifications.');
        }
      } catch (error) {
        console.error('Error unsubscribing phone number:', error);
        twiml.message('An error occurred while trying to unsubscribe. Please try again later.');
      }
    } else {
      // Get lunch info from sheets
      const { lunchMessage, isUpdated } = await getSheetData();

      if (!isUpdated) {
        console.log('Menu is not updated for the current date. No messages will be sent.');
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
        return;
      }

      // Add message to response
      twiml.message(lunchMessage);
    }

    // Send response
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch (error) {
    console.error('Error handling SMS webhook:', error);
    res.status(500).send('Error processing request');
  }
});

export const sms = app;

// export function startServer() {
//   app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//   });
// }

// startServer();