import dotenv from 'dotenv';
import { startServer } from './server';

dotenv.config();

// Start the webhook server
startServer();
