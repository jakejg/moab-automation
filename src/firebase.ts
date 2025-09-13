import * as admin from 'firebase-admin';

let firestore: admin.firestore.Firestore;

export function initializeFirebase() {
  if (admin.apps.length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error('Firebase Admin SDK Error: Missing required environment variables for backend.');
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firestore = app.firestore();
    firestore.settings({ databaseId: 'moab-automation' });
    console.log('Backend Firebase Admin SDK initialized.');
  } else {
    firestore = admin.app().firestore();
  }
}

export { firestore };
