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

    // 3. Generate a unique business ID and URL-friendly name
    const urlName = businessName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-')       // Replace multiple hyphens with single
      .trim();

    // 4. Generate a unique ID for the business
    const businessId = firestore.collection('businesses').doc().id;

    // 5. Check if the URL name is already taken
    const existingBusiness = await firestore
      .collection('businesses')
      .where('urlName', '==', urlName)
      .limit(1)
      .get();

    if (!existingBusiness.empty) {
      return NextResponse.json(
        { error: 'A business with this name already exists. Please choose a different name.' }, 
        { status: 409 }
      );
    }

    // 6. Create Business in Firestore
    const businessRef = firestore.collection('businesses').doc(businessId);

    await businessRef.set({
      id: businessId,
      businessId: businessId, // Keeping for backward compatibility
      name: businessName,
      urlName: urlName,       // Store the URL-friendly name
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
