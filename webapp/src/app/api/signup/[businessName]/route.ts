import { NextResponse } from 'next/server';
import { firestoreAdmin } from '@/lib/firebase-admin';

interface SubscriberData {
  id: string;
  phoneNumber: string;
  businessId: string;
  status: 'active' | 'inactive' | 'unsubscribed';
  signupDate: Date;
  lastUpdated: Date;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ businessName: string }> }
) {
  try {
    const { phone } = await request.json();
    const { businessName } = await params;
    
    console.log('Business name from URL:', businessName);

    if (!phone) {
      return NextResponse.json(
        { message: 'Phone number is required.' }, 
        { status: 400 }
      );
    }

    // 1. Find business by URL-friendly name
    const businessesRef = firestoreAdmin.collection('businesses');
    const querySnapshot = await businessesRef
      .where('urlName', '==', businessName)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { message: 'Business not found.' },
        { status: 404 }
      );
    }

    const businessDoc = querySnapshot.docs[0];
    const businessId = businessDoc.id;

    if (!businessDoc.exists) {
      return NextResponse.json(
        { message: 'Business not found.' },
        { status: 404 }
      );
    }

    // 2. Create a new subscriber document with a custom ID
    const subscriberRef = firestoreAdmin
      .collection('subscribers')
      .doc(); // Auto-generate a document ID

    const subscriberData: SubscriberData = {
      id: subscriberRef.id, // Use the same ID as the document ID
      phoneNumber: phone,
      businessId: businessId,
      status: 'active',
      signupDate: new Date(),
      lastUpdated: new Date()
    };

    // 3. Save the subscriber data
    await subscriberRef.set(subscriberData);

    console.log(`New subscriber (${subscriberRef.id}) added for business ${businessName}: ${phone}`);

    return NextResponse.json({ 
      message: 'Thank you for signing up!',
      subscriberId: subscriberRef.id
    }, { status: 200 });
  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
