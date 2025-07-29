import { Firestore } from '@google-cloud/firestore';

let firestore: Firestore;

try {
  const serviceAccount = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON as string
  );

  firestore = new Firestore({
    projectId: serviceAccount.project_id,
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    },
    databaseId: 'moab-automation',
  });
} catch (e) {
  console.error('Failed to parse service account credentials or initialize Firestore', e);
  // Fallback or handle error appropriately
  // For now, we'll let it be undefined and it will fail downstream
}

export { firestore };
