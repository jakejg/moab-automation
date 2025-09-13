import express from 'express';
import bodyParser from 'body-parser';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import { getSheetData } from './sheets';
import { loadGoogleSecrets } from './gcloud-secrets';
import { initializeFirebase, firestore } from './firebase';

loadGoogleSecrets();
initializeFirebase();

const app = express();
const port = process.env.PORT || 3000;

// Parse incoming POST requests
app.use(bodyParser.urlencoded({ extended: false }));

// Webhook endpoint for incoming SMS
app.post('/sms', async (req, res) => {
  const { To, From, Body, MessageSid, SmsStatus } = req.body;

  // Log the incoming message
  try {
    if (!firestore) {
      console.error('Firestore is not initialized. Skipping incoming SMS logging.');
      return;
    }
    const businessesRef = firestore.collection('businesses');
    const snapshot = await businessesRef.where('twilioPhoneNumber', '==', To).limit(1).get();

    if (!snapshot.empty) {
      const businessDoc = snapshot.docs[0];
      const businessId = businessDoc.id;

      const messagesRef = firestore.collection('messages');
      await messagesRef.add({
        businessId,
        direction: 'incoming',
        sent_at: new Date(),
        from: From,
        to: To,
        body: Body,
        status: SmsStatus,
        messageSid: MessageSid,
      });
    } else {
      console.warn(`No business found for Twilio number: ${To}`);
    }
  } catch (error) {
    console.error('Error logging incoming SMS:', error);
    // Do not block the webhook response for logging errors
  }

  // Original webhook logic to respond to the message
  try {
    const twiml = new MessagingResponse();
    const { lunchMessage, isUpdated } = await getSheetData();

    if (!isUpdated) {
      console.log('Menu is not updated for the current date. No response sent.');
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
      return;
    }

    twiml.message(lunchMessage);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch (error) {
    console.error('Error handling SMS webhook response:', error);
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