// src/lib/firebase.ts
import * as firebaseClient from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Parse the Firebase config from the single environment variable.
const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
if (!firebaseConfigString) {
  throw new Error('NEXT_PUBLIC_FIREBASE_CONFIG is not set in .env.local');
}
const firebaseConfig = JSON.parse(firebaseConfigString);

// Initialize Firebase
let app: firebaseClient.FirebaseApp;
if (!firebaseClient.getApps().length) {
  app = firebaseClient.initializeApp(firebaseConfig);
} else {
  app = firebaseClient.getApp();
}

const auth = getAuth(app);
const firestore = getFirestore(app, 'moab-automation');

// Export the necessary modules for use in other parts of the app
export { app, auth, firestore, firebaseClient, signInWithEmailAndPassword };
