# Lunch Notifier

A TypeScript application that scrapes daily lunch menu data and sends it via SMS to a list of phone numbers stored in Google Sheets.

## Features

- Daily web scraping of lunch menu
- Google Sheets integration for phone number management
- SMS notifications via Twilio
- Runs automatically at 9:00 AM every day

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in all required environment variables

3. Set up Google Sheets:
   - Create a Google Cloud project
   - Enable Google Sheets API
   - Create a service account and download credentials
   - Share your Google Sheet with the service account email
   - Add the sheet ID to your .env file

4. Set up Twilio:
   - Create a Twilio account
   - Get your Account SID and Auth Token
   - Get a Twilio phone number
   - Add Twilio credentials to your .env file

5. Configure web scraping:
   - Update the LUNCH_PAGE_URL in .env
   - Modify the scraper.ts file to match your target website's structure

## Running the Application

Build the application:
```bash
npm run build
```

Start the application:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Google Sheet Structure

The application expects a Google Sheet with a column named 'phoneNumber' containing the phone numbers to notify.
