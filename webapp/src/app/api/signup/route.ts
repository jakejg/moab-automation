import { NextResponse } from 'next/server';
import { firestoreAdmin } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { phone, businessId } = await request.json();

    if (!phone || !businessId) {
      return NextResponse.json({ message: 'Phone number and business ID are required.' }, { status: 400 });
    }

        // Save the new subscriber to Firestore
    await firestoreAdmin.collection('subscribers').add({
      phoneNumber: phone,
      businessId: businessId,
      status: 'active', 
      signupDate: new Date(),
    });

    console.log(`New subscriber added for ${businessId}: ${phone}`);

    return NextResponse.json({ message: 'Thank you for signing up!' }, { status: 200 });
  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
