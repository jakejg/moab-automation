import * as admin from 'firebase-admin';

let firestoreAdmin: admin.firestore.Firestore;
let auth: admin.auth.Auth;

if (admin.apps.length === 0) {
  console.log('Initializing Firebase Admin SDK for the first time...');
  
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error('Firebase Admin SDK Error: Missing required environment variables.');
  }

  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  firestoreAdmin = app.firestore();
  firestoreAdmin.settings({ databaseId: 'moab-automation' });
  auth = app.auth();
  console.log('Firebase Admin SDK and Firestore settings initialized.');
} else {
  // If already initialized, just get the instances.
  const app = admin.app();
  firestoreAdmin = app.firestore();
  auth = app.auth();
}

export { firestoreAdmin, auth };
