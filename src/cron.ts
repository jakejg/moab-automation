import dotenv from 'dotenv';
import { getSheetData } from './sheets';
import { sendMessages } from './twilio';

dotenv.config();

export async function runDailyNotification() {
  try {
    // 1. Get phone numbers and lunch info from Google Sheets
    const { phoneNumbers, lunchMessage } = await getSheetData();
    
    // 2. Send messages to all numbers
    // await sendMessages(phoneNumbers, lunchMessage);
    
    console.log('Daily notification completed successfully');
  } catch (error) {
    console.error('Error in daily notification:', error);
  }
}

// Run the daily notification if this file is run directly
if (require.main === module) {
  runDailyNotification();
}
