import { NextResponse } from 'next/server';
import { firestoreAdmin as firestore } from '@/lib/firebase-admin';
import twilio from 'twilio';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  try {
    const { message, businessId } = await request.json();

    if (!message || !businessId) {
      return NextResponse.json({ message: 'Message and business ID are required.' }, { status: 400 });
    }

    // 1. Fetch business details to get the Twilio phone number
    const businessQuery = await firestore.collection('businesses').where('businessId', '==', businessId).limit(1).get();

    if (businessQuery.empty) {
      return NextResponse.json({ message: 'Business not found.' }, { status: 404 });
    }

    const businessData = businessQuery.docs[0].data();
    const twilioPhoneNumber = businessData.twilioPhoneNumber;

    if (!twilioPhoneNumber) {
      return NextResponse.json({ message: 'Twilio phone number for this business is not configured.' }, { status: 500 });
    }

    // 2. Fetch all active subscribers for the business
    const subscribersSnapshot = await firestore
      .collection('subscribers')
      .where('businessId', '==', businessId)
      .where('status', '==', 'active')
      .get();

    if (subscribersSnapshot.empty) {
      return NextResponse.json({ message: 'No active subscribers to send to.' });
    }

    const phoneNumbers = subscribersSnapshot.docs.map(doc => doc.data().phoneNumber);

    // 3. Send messages via Twilio
    const sendPromises = phoneNumbers.map(phoneNumber =>
      twilioClient.messages.create({
        body: message,
        to: phoneNumber,
        from: twilioPhoneNumber,
      })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({ message: `Successfully sent message to ${phoneNumbers.length} subscribers.` });

  } catch (error) {
    console.error('Send message API error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
