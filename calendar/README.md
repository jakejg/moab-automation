# Calendar Availability Service

This service allows you to check for availability on Google Calendars that have been shared with a specific Google Service Account.

## Step 1: Your Setup (One-time)

### 1. Create a Google Service Account
- Go to the [Google Cloud Console](https://console.cloud.google.com/).
- Create a new project or use an existing one.
- In the navigation menu, go to **IAM & Admin > Service Accounts**.
- Click **Create Service Account**, give it a name (e.g., "Calendar Availability Checker"), and click **Create and Continue**.
- Grant it the "Viewer" role, then click **Done**. (Note: This role is for the GCP project and does not affect Calendar permissions.)

### 2. Generate a Private Key
- Find the service account you just created in the list.
- Click the three-dot menu under "Actions" and select **Manage keys**.
- Click **Add Key > Create new key**.
- Choose **JSON** and click **Create**. A JSON file containing the private key will be downloaded.

### 3. Enable the Google Calendar API
- In the navigation menu, go to **APIs & Services > Library**.
- Search for "Google Calendar API" and enable it for your project.

### 4. Configure Your Service
- Open the downloaded JSON key file.
- Create a `.env` file in the `calendar/` directory (you can copy `.env.example`).
- Copy the `client_email` from the JSON file and set it as `GOOGLE_SERVICE_ACCOUNT_EMAIL` in your `.env` file.
- Copy the `private_key` from the JSON file (including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines) and set it as `GOOGLE_PRIVATE_KEY`.
- Generate a secure API key and set it as `API_KEY`. You can use this command:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

## Step 2: Client Setup (For each client)

This is the only part your clients need to do. It's simple and secure.

### Share Their Calendar
1.  Provide your clients with the service account's email address (the one you set as `GOOGLE_SERVICE_ACCOUNT_EMAIL`).
2.  The client needs to open their Google Calendar.
3.  Find the calendar they want to share, click the three-dot menu, and select **Settings and sharing**.
4.  Under **Share with specific people or groups**, click **Add people and groups**.
5.  Paste the service account email address and set the permissions to **See all event details**.
6.  Click **Send**.

## Step 3: Using the Service

You can now check your clients' availability by making a `POST` request to your service's `/api/availability` endpoint.

-   **Header**: Include your secret API key in the `x-api-key` header.
-   **Body**: Provide the client's calendar ID (which is usually their email address) in the `calendars` array.