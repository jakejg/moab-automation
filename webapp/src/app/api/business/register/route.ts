import { NextResponse } from 'next/server';
import { firestoreAdmin as firestore } from '@/lib/firebase-admin';
import { auth } from '@/lib/firebase-admin'; // Using Firebase Admin for user creation


export async function POST(request: Request) {
  try {
    const { businessName, ownerName, email, password } = await request.json();

    // 1. Basic Validation
    if (!businessName || !ownerName || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    // 2. Create User with Firebase Auth
    const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: ownerName,
    });

    // 3. Create a URL-friendly businessId from the business name
    const potentialId = businessName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // 4. Check if this businessId already exists
    const existingBusiness = await firestore.collection('businesses').doc(potentialId).get();
    if (existingBusiness.exists) {
        return NextResponse.json({ error: 'A business with this name already exists. Please choose a different name.' }, { status: 409 });
    }
    const businessId = potentialId;

    // 5. Create Business in Firestore
    const businessRef = firestore.collection('businesses').doc(businessId);

    await businessRef.set({
        businessId: businessId,
        name: businessName,
        ownerName: ownerName,
        ownerEmail: email,
        userId: userRecord.uid, // Link to the created user
        createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
        message: 'Business registered successfully!', 
        businessId: businessId,
        userId: userRecord.uid
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Registration Error:', error);
    let errorMessage = 'An unexpected error occurred.';
    let statusCode = 500;

    if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'This email address is already in use by another account.';
            statusCode = 409; // Conflict
        }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
