import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library'

interface SheetData {
  phoneNumbers: string[];
  lunchMessage: string;
  isUpdated: boolean;
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
    const lunchInfo = rows.map(row => row.get('lunchInfo'));

    const menuDateString = lunchInfo[0] ? lunchInfo[0].toString().trim() : '';
    const isUpdated = isMenuUpdated(menuDateString);

    let lunchMessage = '';
    if (isUpdated) {
      lunchMessage = createlunchMessage(lunchInfo);
    } else {
      // Optionally, you could set a specific message or leave it empty
      // if the calling function will handle the !isUpdated case.
      // For now, we'll make it clear the menu isn't current if we try to create it.
      console.log('Menu is not for the current date. Not generating lunch message.');
    }

    return { phoneNumbers, lunchMessage, isUpdated };
  } catch (error) {
    console.error('Error fetching data from sheet:', error);
    throw error;
  }
}

function createlunchMessage(lunchInfo: string[]) {
  const paragraph = lunchInfo.map((item) => item == undefined ? '' : item).join('\n');
  return `Moonflower's lunch menu: ${paragraph}`;
}

function isMenuUpdated(dateStringFromSheet: string): boolean {
  if (!dateStringFromSheet) {
    console.log('Date string from sheet is empty.');
    return false;
  }

  // Example dateStringFromSheet: "Tuesday 5/6/25"
  // We need to parse out "5/6/25"
  const datePart = dateStringFromSheet.split(' ')[1];
  if (!datePart) {
    console.log('Could not parse date part from sheet string:', dateStringFromSheet);
    return false;
  }

  const parts = datePart.split('/');
  if (parts.length !== 3) {
    console.log('Date part from sheet is not in MM/DD/YY format:', datePart);
    return false;
  }

  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10) + 2000; // Assuming YY is for 20YY

  if (isNaN(month) || isNaN(day) || isNaN(year)) {
    console.log('Could not parse month, day, or year from date part:', datePart);
    return false;
  }

  const sheetDate = new Date(year, month - 1, day); // Month is 0-indexed in JS Date

  // Get current date, normalizing to midnight for accurate day comparison
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  sheetDate.setHours(0,0,0,0); // Also normalize sheet date to midnight

  console.log('Sheet Date:', sheetDate.toDateString());
  console.log('Current Date:', currentDate.toDateString());

  return sheetDate.getTime() === currentDate.getTime();
}

export async function removePhoneNumber(phoneNumberToRemove: string): Promise<boolean> {
  try {
    const SCOPES = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ];

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


    // Find the row to delete
    // Normalize the incoming phone number from Twilio (E.164 format) to match the sheet format
    const normalizedPhoneNumber = phoneNumberToRemove.startsWith('+1')
      ? phoneNumberToRemove.slice(2)
      : phoneNumberToRemove;

    const rowToDelete = rows.find(row => row.get('phoneNumber') === normalizedPhoneNumber);

    if (!rowToDelete) {
      console.log(`Phone number ${phoneNumberToRemove} not found.`);
      return false;
    }

    // Get column index from header
    await sheet.loadHeaderRow();
    const phoneNumberColIndex = sheet.headerValues.indexOf('phoneNumber');

    if (phoneNumberColIndex === -1) {
      console.error('"phoneNumber" column not found.');
      return false;
    }

    // Prepare the batchUpdate request to delete the cell and shift others up
    const request = {
      requests: [
        {
          deleteRange: {
            range: {
              sheetId: sheet.sheetId,
              startRowIndex: rowToDelete.rowNumber - 1, // rowNumber is 1-based, API is 0-based
              endRowIndex: rowToDelete.rowNumber,
              startColumnIndex: phoneNumberColIndex,
              endColumnIndex: phoneNumberColIndex + 1,
            },
            shiftDimension: 'ROWS',
          },
        },
      ],
    };

    // Make the raw API request using the authenticated JWT client
    await jwt.request({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${doc.spreadsheetId}:batchUpdate`,
      method: 'POST',
      data: request,
    });

    console.log(`Phone number ${phoneNumberToRemove} removed successfully.`);
    return true;

  } catch (error) {
    console.error('Error removing phone number from sheet:', error);
    throw error;
  }
}

// Keeping this for backward compatibility
export async function getPhoneNumbers(): Promise<string[]> {
  const data = await getSheetData();
  // Decide how to handle this if isUpdated is false. 
  // For now, it still returns phone numbers, but the caller should check isUpdated.
  return data.phoneNumbers;
}
