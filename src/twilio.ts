import twilio from 'twilio';

export async function sendMessages(phoneNumbers: string[], message: string): Promise<void> {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const sendPromises = phoneNumbers.map(phoneNumber =>
    client.messages.create({
      body: "Moonflower's lunch menu: " + message,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    })
  );

  try {
    await Promise.all(sendPromises);
    console.log(`Successfully sent messages to ${phoneNumbers.length} recipients`);
  } catch (error) {
    console.error('Error sending messages:', error);
    throw error;
  }
}


