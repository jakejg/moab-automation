import twilio from 'twilio';

export async function sendMessages(phoneNumbers: string[], message: string): Promise<void> {
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

    const successes = results.filter(r => r.status === 'fulfilled');
    const failures = results.filter(r => r.status === 'rejected');

    console.log(`Sent: ${successes.length}`);
    console.log(`Failed: ${failures.length}`);
    console.log(`Successfully sent messages to ${phoneNumbers.length} recipients`);
  } catch (error) {
    console.error('Error sending messages:', error);
    throw error;
  }
}


