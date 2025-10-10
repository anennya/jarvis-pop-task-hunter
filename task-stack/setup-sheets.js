#!/usr/bin/env node

/**
 * Google Sheets Setup Helper
 * 
 * This script helps you set up Google Sheets integration for the Task Stack app.
 * Run this after you've created your service account and spreadsheet.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Task Stack - Google Sheets Setup Helper\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📄 Creating .env.local from .env.example...');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env.local created\n');
  } else {
    console.log('❌ .env.example not found. Creating basic .env.local...');
    fs.writeFileSync(envPath, 'DATA_BACKEND=mock\n');
  }
}

console.log('📋 Google Sheets Integration Setup Steps:\n');

console.log('1. 🔧 Google Cloud Console Setup:');
console.log('   • Go to: https://console.cloud.google.com/');
console.log('   • Create project or select existing');
console.log('   • Enable Google Sheets API');
console.log('   • Create Service Account');
console.log('   • Download JSON credentials\n');

console.log('2. 📊 Google Spreadsheet Setup:');
console.log('   • Create new Google Sheet: https://sheets.google.com/');
console.log('   • Add two tabs: "Tasks" and "Slices"');
console.log('   • Add headers to both tabs (see README for details)');
console.log('   • Share with service account email (Editor permission)');
console.log('   • Copy spreadsheet ID from URL\n');

console.log('3. ⚙️  Environment Configuration:');
console.log('   • Edit .env.local with your values:');
console.log('   • Set DATA_BACKEND=sheets');
console.log('   • Set SHEETS_ID="your-spreadsheet-id"');
console.log('   • Set GOOGLE_SERVICE_ACCOUNT_JSON=\'{"type":"service_account",...}\'');
console.log('   • Restart: npm run dev\n');

console.log('4. 🧪 Test the Integration:');
console.log('   • Visit: http://localhost:3000');
console.log('   • Add a test task');
console.log('   • Check if it appears in your Google Sheet\n');

console.log('📚 Need detailed instructions? Check the README.md file.');
console.log('🐛 Issues? Make sure service account has Editor permission on the sheet.\n');

// Validate current environment
console.log('🔍 Current Configuration:');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  const config = {};
  lines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      config[key] = valueParts.join('=');
    }
  });
  
  console.log(`   • DATA_BACKEND: ${config.DATA_BACKEND || 'not set'}`);
  console.log(`   • SHEETS_ID: ${config.SHEETS_ID ? 'set' : 'not set'}`);
  console.log(`   • GOOGLE_SERVICE_ACCOUNT_JSON: ${config.GOOGLE_SERVICE_ACCOUNT_JSON ? 'set' : 'not set'}`);
  
  if (config.DATA_BACKEND === 'sheets') {
    if (config.SHEETS_ID && config.GOOGLE_SERVICE_ACCOUNT_JSON) {
      console.log('\n✅ Google Sheets configuration looks complete!');
      console.log('   Restart the dev server if needed: npm run dev');
    } else {
      console.log('\n⚠️  Google Sheets backend selected but configuration incomplete.');
      console.log('   Please set SHEETS_ID and GOOGLE_SERVICE_ACCOUNT_JSON in .env.local');
    }
  }
} catch (error) {
  console.log('   Error reading configuration:', error.message);
}

console.log('\n🎯 Quick Start Template for .env.local:');
console.log('DATA_BACKEND=sheets');
console.log('SHEETS_ID="1a2b3c4d5e6f7g8h9i0j-EXAMPLE-SPREADSHEET-ID"');
console.log('GOOGLE_SERVICE_ACCOUNT_JSON=\'{"type":"service_account","project_id":"..."}\'');