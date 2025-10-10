#!/usr/bin/env node

/**
 * Google Sheets Connection Test
 * 
 * This script tests your Google Sheets configuration and sets up the headers.
 */

require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function testSheetsConnection() {
  console.log('🧪 Testing Google Sheets Connection...\n');

  // Check environment variables
  const backend = process.env.DATA_BACKEND;
  const sheetsId = process.env.SHEETS_ID;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  console.log(`📋 Configuration Check:`);
  console.log(`   • DATA_BACKEND: ${backend}`);
  console.log(`   • SHEETS_ID: ${sheetsId ? 'set' : 'missing'}`);
  console.log(`   • GOOGLE_SERVICE_ACCOUNT_JSON: ${serviceAccountJson ? 'set' : 'missing'}\n`);

  if (backend !== 'sheets') {
    console.log('⚠️  DATA_BACKEND is not set to "sheets". Update .env.local to test Sheets integration.');
    return;
  }

  if (!sheetsId) {
    console.log('❌ SHEETS_ID is missing. Please add it to .env.local');
    return;
  }

  if (!serviceAccountJson) {
    console.log('❌ GOOGLE_SERVICE_ACCOUNT_JSON is missing. Please add it to .env.local');
    return;
  }

  try {
    // Parse and validate service account JSON
    const creds = JSON.parse(serviceAccountJson);
    
    if (!creds.client_email || !creds.private_key) {
      console.log('❌ Invalid service account JSON. Missing client_email or private_key.');
      return;
    }

    console.log(`🔑 Service Account: ${creds.client_email}\n`);

    // Ensure private key is properly formatted
    let privateKey = creds.private_key;
    if (privateKey && !privateKey.includes('\n')) {
      // If the private key doesn't have line breaks, add them
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    // Create Google Sheets client
    const auth = new google.auth.JWT({
      email: creds.client_email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Test authentication first
    console.log('🔐 Testing authentication...');
    await auth.authorize();
    console.log('✅ Authentication successful');

    const sheets = google.sheets({ version: 'v4', auth });

    // Test connection by getting spreadsheet metadata
    console.log('🔌 Testing connection...');
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetsId,
    });

    console.log(`✅ Connected to spreadsheet: "${spreadsheet.data.properties.title}"`);
    
    // List existing sheets
    const sheetsList = spreadsheet.data.sheets.map(s => s.properties.title);
    console.log(`📊 Found sheets: ${sheetsList.join(', ')}\n`);

    // Check if Tasks and Slices sheets exist
    const hasTasksSheet = sheetsList.includes('Tasks');
    const hasSlicesSheet = sheetsList.includes('Slices');

    if (!hasTasksSheet || !hasSlicesSheet) {
      console.log('⚠️  Missing required sheets:');
      if (!hasTasksSheet) console.log('   • "Tasks" sheet missing');
      if (!hasSlicesSheet) console.log('   • "Slices" sheet missing');
      console.log('\n📝 Please create these sheets in your Google Spreadsheet.');
      return;
    }

    // Check and set up headers
    console.log('🔍 Checking sheet headers...');
    
    // Tasks headers
    const tasksHeaders = ['id', 'user_id', 'title', 'category', 'importance', 'energy', 'context', 'estimate_minutes', 'due_at', 'notes', 'link', 'created_at'];
    await checkAndSetupHeaders(sheets, sheetsId, 'Tasks', tasksHeaders);
    
    // Slices headers
    const slicesHeaders = ['id', 'task_id', 'title', 'sequence_index', 'planned_minutes', 'status', 'skip_count', 'snoozed_until', 'done_at'];
    await checkAndSetupHeaders(sheets, sheetsId, 'Slices', slicesHeaders);

    console.log('\n🎉 Google Sheets integration is ready!');
    console.log('   You can now restart your app and it will use Google Sheets as storage.');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('\n💡 Troubleshooting Tips:');
      console.log('   • Make sure you shared the spreadsheet with the service account email');
      console.log('   • Give the service account "Editor" permission');
      console.log(`   • Service account email: ${JSON.parse(serviceAccountJson).client_email}`);
    }
    
    if (error.message.includes('not found')) {
      console.log('\n💡 Troubleshooting Tips:');
      console.log('   • Check that the SHEETS_ID is correct');
      console.log('   • Make sure the spreadsheet exists and is accessible');
    }
  }
}

async function checkAndSetupHeaders(sheets, spreadsheetId, sheetName, expectedHeaders) {
  try {
    // Get first row to check headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`,
    });

    const existingHeaders = response.data.values ? response.data.values[0] : [];
    
    if (existingHeaders.length === 0) {
      // No headers, set them up
      console.log(`   📝 Setting up headers for ${sheetName} sheet...`);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:${String.fromCharCode(65 + expectedHeaders.length - 1)}1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [expectedHeaders]
        }
      });
      console.log(`   ✅ ${sheetName} headers set up`);
    } else {
      // Check if headers match
      const headersMatch = expectedHeaders.every((header, index) => existingHeaders[index] === header);
      if (headersMatch && existingHeaders.length === expectedHeaders.length) {
        console.log(`   ✅ ${sheetName} headers are correct`);
      } else {
        console.log(`   ⚠️  ${sheetName} headers don't match expected format`);
        console.log(`      Expected: ${expectedHeaders.join(', ')}`);
        console.log(`      Found: ${existingHeaders.join(', ')}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error checking ${sheetName} headers:`, error.message);
  }
}

// Run the test
testSheetsConnection().catch(console.error);