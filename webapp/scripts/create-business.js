// This script creates a new business in your Firestore database with a hashed password.
// Usage: node scripts/create-business.js <businessId> <businessName> <password> <twilioPhoneNumber>

// Load environment variables from .env.local at the root of the webapp directory
require('dotenv').config({ path: '.env.local' });

const { Firestore } = require('@google-cloud/firestore');
const bcrypt = require('bcrypt');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  console.error('Error: GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable not set.');
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// Initialize Firestore directly with project details and the custom database ID
const firestore = new Firestore({
  projectId: serviceAccount.project_id,
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
  },
  databaseId: 'moab-automation',
});

const createBusiness = async (businessId, businessName, password, twilioPhoneNumber) => {
  if (!businessId || !businessName || !password || !twilioPhoneNumber) {
    console.error('Usage: node scripts/create-business.js <businessId> <businessName> <password> <twilioPhoneNumber>');
    process.exit(1);
  }

  try {
    // Check if business already exists
    const existingBusiness = await firestore.collection('businesses').where('businessId', '==', businessId).get();
    if (!existingBusiness.empty) {
      console.error(`Error: Business with ID "${businessId}" already exists.`);
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await firestore.collection('businesses').add({
      businessId,
      businessName,
      password: hashedPassword,
      twilioPhoneNumber,
      createdAt: new Date(),
    });

    console.log(`Successfully created business: ${businessName} (${businessId})`);
  } catch (error) {
    console.error('Error creating business:', error);
  } finally {
    // The script will hang without this, as the Firestore connection remains open.
    process.exit(0);
  }
};

const [,, businessId, businessName, password, twilioPhoneNumber] = process.argv;
createBusiness(businessId, businessName, password, twilioPhoneNumber);
