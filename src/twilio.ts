import twilio from 'twilio';
import { logSMS } from './analytics';

export async function sendMessages(phoneNumbers: string[], message: string, businessId: string): Promise<void> {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const sendPromises = phoneNumbers.map(phoneNumber =>
    client.messages.create({
      body: message,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    })
  );

  try {
    const results = await Promise.allSettled(sendPromises);
    const successfulSends = await logSMS(businessId, results);
    console.log(`Successfully sent and logged ${successfulSends} out of ${phoneNumbers.length} messages`);
  } catch (error) {
    console.error('Error sending messages:', error);
    throw error;
  }
}


