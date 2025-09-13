import dotenv from 'dotenv';
import { getSheetData } from './sheets';
import { sendMessages } from './twilio';

dotenv.config();

export async function runDailyNotification() {
  try {
    // 1. Get phone numbers and lunch info from Google Sheets
    const { phoneNumbers, lunchMessage, isUpdated } = await getSheetData();
    
    if (isUpdated) {
      if (lunchMessage && phoneNumbers.length > 0) {
        // 2. Send messages to all numbers
        const moonflowerBusinessId = 'g0OGnuWAPatvakhNy3To'; // Hardcoded for now
        await sendMessages(phoneNumbers, lunchMessage, moonflowerBusinessId);
        console.log('Daily notification completed successfully');
      } else if (phoneNumbers.length === 0) {
        console.log('No phone numbers found in the sheet. No messages sent.');
      } else {
        // This case implies isUpdated was true, but lunchMessage was empty.
        // sheets.ts should prevent this, but good to have a log.
        console.log('Menu is updated, but lunch message is empty. No messages sent.');
      }
    } else {
      console.log('Menu is not updated for the current date. No messages will be sent.');
    }

  } catch (error) {
    console.error('Error in daily notification:', error);
  }
}

// Run the daily notification if this file is run directly
if (require.main === module) {
  runDailyNotification();
}
