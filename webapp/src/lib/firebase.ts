import { Firestore } from '@google-cloud/firestore';

let firestore: Firestore;

// When running on GCP (like Cloud Run), the library automatically uses the
// service account associated with the resource. For local development, we use
// the GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  console.log('Initializing Firestore with service account credentials for local development.');
  const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  firestore = new Firestore({
    projectId: serviceAccount.project_id,
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    },
    databaseId: 'moab-automation',
  });
} else {
  console.log('Initializing Firestore with Application Default Credentials for GCP environment.');
  // The project ID will be inferred from the GCP environment.
  firestore = new Firestore({
    databaseId: 'moab-automation',
  });
}

export { firestore };
