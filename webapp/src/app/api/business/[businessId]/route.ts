import { firestoreAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// Helper function to convert a business name to URL-friendly format
function toUrlFriendly(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .trim();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    // First try to find by URL-friendly name
    const businessesRef = firestoreAdmin.collection('businesses');
    const querySnapshot = await businessesRef
      .where('urlName', '==', businessId)
      .limit(1)
      .get();

    let businessDocSnap;
    
    // If not found by URL name, try by document ID
    if (querySnapshot.empty) {
      businessDocSnap = await businessesRef.doc(businessId).get();
      if (!businessDocSnap.exists) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }
    } else {
      businessDocSnap = querySnapshot.docs[0];
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

  } catch (error: unknown) {
    console.error(`Error fetching business '${(await params).businessId}':`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
