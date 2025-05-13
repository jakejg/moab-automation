import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

const INVOICE_DATA_FILE = path.join(__dirname, '..', 'invoice_data.json'); // Store in project root
const EMAIL_TO = process.env.INVOICE_EMAIL_TO || 'your-email@example.com';
const EMAIL_FROM = process.env.INVOICE_EMAIL_USER || 'your-email@example.com'; // Sender email from env variable

interface InvoiceData {
    lastInvoiceNumber: number;
}

async function getLastInvoiceNumber(): Promise<number> {
    try {
        if (fs.existsSync(INVOICE_DATA_FILE)) {
            const data = fs.readFileSync(INVOICE_DATA_FILE, 'utf-8');
            const jsonData: InvoiceData = JSON.parse(data);
            return jsonData.lastInvoiceNumber || 0;
        }
    } catch (error) {
        console.error('Error reading invoice data file:', error);
    }
    return 0; // Default if file doesn't exist or is invalid
}

async function saveLastInvoiceNumber(invoiceNumber: number): Promise<void> {
    try {
        const jsonData: InvoiceData = { lastInvoiceNumber: invoiceNumber };
        fs.writeFileSync(INVOICE_DATA_FILE, JSON.stringify(jsonData, null, 2));
    } catch (error) {
        console.error('Error writing invoice data file:', error);
    }
}

function generateInvoiceHTML(invoiceNumberStr: string): string {
    const currentDate = new Date().toLocaleDateString('en-US');
    return `
        <p>Client: Moonflower</p>
        <p>Date: ${currentDate}</p>
        <p>Prepared By: Jake Gerry Invoice</p>
        <p>Invoice Number: ${invoiceNumberStr}</p>
        <br>
        <table border="1" cellpadding="5" cellspacing="0">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Cost</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        Monthly Subscription<br>
                        <small>Up to 100 SMS messages (sending + receiving) per day ~ 3,000 per month</small>
                    </td>
                    <td>$50.00</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td><strong>Total Due</strong></td>
                    <td><strong>$50.00</strong></td>
                </tr>
            </tfoot>
        </table>
    `;
}

async function sendInvoiceEmail() {
    console.log('Starting invoice email process...');

    const lastInvoiceNum = await getLastInvoiceNumber();
    const currentInvoiceNum = lastInvoiceNum + 1;
    const invoiceNumberStr = `COOP-${String(currentInvoiceNum).padStart(4, '0')}`;

    const mailTransporter = nodemailer.createTransport({
        host: process.env.INVOICE_SMTP_HOST, // e.g., 'smtp.gmail.com'
        port: parseInt(process.env.INVOICE_SMTP_PORT || '587', 10), // e.g., 587 for TLS, 465 for SSL
        secure: (process.env.INVOICE_SMTP_SECURE === 'true'), // true for 465, false for other ports
        auth: {
            user: process.env.INVOICE_EMAIL_USER, // Your email address
            pass: process.env.INVOICE_EMAIL_PASSWORD, // Your email password or app-specific password
        },
    });

    const mailDetails = {
        from: EMAIL_FROM,
        to: EMAIL_TO,
        subject: `Invoice ${invoiceNumberStr} for Moonflower Coop`,
        html: generateInvoiceHTML(invoiceNumberStr),
    };

    try {
        console.log(`Attempting to send invoice ${invoiceNumberStr} to ${EMAIL_TO}...`);
        const info = await mailTransporter.sendMail(mailDetails);
        console.log('Email sent successfully: ' + info.response);
        await saveLastInvoiceNumber(currentInvoiceNum);
        console.log(`Saved new invoice number: ${currentInvoiceNum}`);
    } catch (err) {
        console.error('Error sending email or saving invoice number:', err);
        // Optionally, rethrow or handle to prevent invoice number from being saved if email fails
    }
}

if (require.main === module) {
    // Check for necessary environment variables
    if (!process.env.INVOICE_SMTP_HOST || !process.env.INVOICE_EMAIL_USER || !process.env.INVOICE_EMAIL_PASSWORD) {
        console.error('Error: Missing required environment variables for sending email.');
        console.error('Please set INVOICE_SMTP_HOST, INVOICE_EMAIL_USER, and INVOICE_EMAIL_PASSWORD.');
        process.exit(1);
    }
    sendInvoiceEmail().catch(err => {
        console.error('Unhandled error in sendInvoiceEmail:', err);
        process.exit(1);
    });
}

export { sendInvoiceEmail }; // Export if you might call it from elsewhere
