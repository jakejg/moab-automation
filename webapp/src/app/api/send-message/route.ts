import { NextResponse } from 'next/server';
import { firestoreAdmin as firestore } from '@/lib/firebase-admin';
import twilio from 'twilio';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { getSheetData } from './sheets';

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    throw new Error('Missing Twilio credentials in environment variables');
  }

  return twilio(sid, token);
}


interface SessionUser {
  id: string;
  email: string;
  name: string;
  businessId: string;
}

export async function POST(request: Request) {
  try {
    const twilioClient = getTwilioClient();
    const { message } = await request.json();
    const session = await getServerSession(authOptions);
    
    // 1. Validate request
    if (!message) {
      return NextResponse.json(
        { message: 'Message is required.' }, 
        { status: 400 }
      );
    }

    // 2. Verify user is authenticated and has a business
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized: Please log in.' },
        { status: 401 }
      );
    }

    const user = session.user as SessionUser;
    const businessId = user.businessId;
    
    if (!businessId) {
      return NextResponse.json(
        { message: 'No business associated with this account.' },
        { status: 403 }
      );
    }
    console.log(`User ${user.id} attempting to send message for business ${businessId}`);

    // 3. Verify business exists
    const businessDoc = await firestore.collection('businesses').doc(businessId).get();
    
    if (!businessDoc.exists) {
      return NextResponse.json(
        { message: 'Business not found.' }, 
        { status: 404 }
      );
    }

    const businessData = businessDoc.data();
    
    if (!businessData) {
      return NextResponse.json(
        { message: 'Business data is corrupted.' },
        { status: 500 }
      );
    }

    // 4. Verify the business belongs to the user
    if (businessData.userId !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have permission to send messages for this business.' },
        { status: 403 }
      );
    }

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

    let phoneNumbers: string[] = [];
    
    /********** Custom logic for moonflower **********/
    if (businessId === 'g0OGnuWAPatvakhNy3To') {
      const sheetData = await getSheetData();
      phoneNumbers = sheetData.phoneNumbers;
    }
    else {
      if (subscribersSnapshot.empty) {
        return NextResponse.json({ message: 'No active subscribers to send to.' });
      }
      phoneNumbers = subscribersSnapshot.docs.map(doc => doc.data().phoneNumber);
    }

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
