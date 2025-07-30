import { firestoreAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { businessId: string } }
) {
  try {
    const { businessId } = await params;

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const businessDocRef = firestoreAdmin.collection('businesses').doc(businessId);
    const businessDocSnap = await businessDocRef.get();

    if (!businessDocSnap.exists) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const businessData = businessDocSnap.data();

    // Sanitize data before sending to client - never expose secrets
    if (businessData?.twilio) {
      delete businessData.twilio.authToken;
    }
    if (businessData?.openai) {
      delete businessData.openai.apiKey;
    }

    return NextResponse.json(businessData);

  } catch (error: any) {
    console.error(`Error fetching business '${params.businessId}':`, error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
