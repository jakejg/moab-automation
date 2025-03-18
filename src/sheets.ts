import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library'

interface SheetData {
  phoneNumbers: string[];
  lunchMessage: string;
}

export async function getSheetData(): Promise<SheetData> {
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
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    
    // Get phone numbers and lunch info from the sheet
    const phoneNumbers = rows.map(row => row.get('phoneNumber')).filter(Boolean);
    const lunchInfo = rows.map(row => row.get('lunchInfo')).filter(Boolean);
    console.log({lunchInfo})
    const lunchMessage = createlunchMessage(lunchInfo);
    console.log({ phoneNumbers, lunchMessage });
    return { phoneNumbers, lunchMessage };
  } catch (error) {
    console.error('Error fetching data from sheet:', error);
    throw error;
  }
}

function createlunchMessage(lunchInfo: string[]) {
  
  return `Moonflower's lunch menu: ${lunchInfo.join(', ')}`;
}

// Keeping this for backward compatibility
export async function getPhoneNumbers(): Promise<string[]> {
  const data = await getSheetData();
  return data.phoneNumbers;
}
