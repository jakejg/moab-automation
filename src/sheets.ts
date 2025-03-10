import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library'

export async function getPhoneNumbers(): Promise<string[]> {
  try {
    const SCOPES = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ];
    
    // Handle the private key properly by replacing escaped newlines
    const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');
    
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: SCOPES,
    });
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt);

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // Assuming phone numbers are in the first sheet
    const rows = await sheet.getRows();
    
    // Access the value using get() method
    const phoneNumbers = rows.map(row => row.get('phoneNumber')).filter(Boolean);
    console.log({phoneNumbers})
    return phoneNumbers;
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    throw error;
  }
}
