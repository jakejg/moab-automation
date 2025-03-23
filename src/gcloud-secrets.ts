import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export function loadGoogleSecrets() {
  
// Initialize Secret Manager client
const client = new SecretManagerServiceClient();

async function getSecret(secretName: string): Promise<string | undefined> {
  // Access secret version from Secret Manager
  const [version] = await client.accessSecretVersion({
    name: `projects/moonflower-453318/secrets/${secretName}/versions/latest`,
  });

  // Return secret data as string
  return version?.payload?.data?.toString();
}

(async () => {
  try {
    // Fetch all the secrets from Secret Manager
    process.env.TWILIO_ACCOUNT_SID = await getSecret('TWILIO_ACCOUNT_SID');
    process.env.TWILIO_AUTH_TOKEN = await getSecret('TWILIO_AUTH_TOKEN');
    process.env.GOOGLE_SHEET_ID = await getSecret('GOOGLE_SHEET_ID');
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = await getSecret('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    process.env.GOOGLE_PRIVATE_KEY = await getSecret('GOOGLE_PRIVATE_KEY');
    process.env.TWILIO_PHONE_NUMBER = await getSecret('TWILIO_PHONE_NUMBER');

    console.log('Secrets successfully loaded.');

  } catch (error) {
    console.error('Error loading secrets:', error);
  }
})();
};
