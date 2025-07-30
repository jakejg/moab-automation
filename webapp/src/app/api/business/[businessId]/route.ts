import { firestore } from '@/lib/firebase';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const businessId = (await params).businessId;

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const businessesRef = firestore.collection('businesses');
    const snapshot = await businessesRef
      .where('businessId', '==', businessId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const businessDoc = snapshot.docs[0];
    const businessData = businessDoc.data();

    return NextResponse.json({
      businessName: businessData.businessName,
      headline:
        businessData.headline ||
        `Join the ${businessData.businessName} VIP List!`,
      subHeadline:
        businessData.subHeadline ||
        "Get a text when we have daily specials. We'll only text you the good stuff.",
      complianceText:
        businessData.complianceText ||
        'By submitting your phone number, you agree to receive promotional text messages. Message and data rates may apply. Reply STOP to unsubscribe.',
    });
  } catch (error) {
    console.error('Error fetching business data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
