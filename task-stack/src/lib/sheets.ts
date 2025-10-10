import { google } from 'googleapis';

export function sheetsClient() {
  const credsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credsJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is required');
  }
  
  const creds = JSON.parse(credsJson);
  
  // Ensure private key is properly formatted
  let privateKey = creds.private_key;
  if (privateKey && !privateKey.includes('\n')) {
    // If the private key doesn't have line breaks, add them
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  return google.sheets({ version: 'v4', auth });
}