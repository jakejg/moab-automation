import dotenv from 'dotenv';
import cron from 'node-cron';
import { getLunchMenu } from './scraper';
import { getPhoneNumbers } from './sheets';
import { sendMessages } from './twilio';

dotenv.config();


async function runDailyNotification() {
  try {
    // 1. Scrape lunch menu
    const lunchMenu = await getLunchMenu();
    
    // 2. Get phone numbers from Google Sheets
    const phoneNumbers = await getPhoneNumbers();
    
    // 3. Send messages to all numbers
    await sendMessages(phoneNumbers, lunchMenu);
    
    console.log('Daily notification completed successfully');
  } catch (error) {
    console.error('Error in daily notification:', error);
  }
}

// Run every day at 9:00 AM
cron.schedule('0 9 * * *', runDailyNotification);

// Initial run for testing
runDailyNotification();
