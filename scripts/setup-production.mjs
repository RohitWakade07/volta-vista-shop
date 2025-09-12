#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🚀 Production Setup Helper\n');

// Check if .env file exists
const envPath = path.join(projectRoot, '.env');
const envExamplePath = path.join(projectRoot, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
} else {
  console.log('❌ .env file not found');
  
  // Create .env.example if it doesn't exist
  if (!fs.existsSync(envExamplePath)) {
    const envExampleContent = `# PhonePe Production API Configuration
VITE_PHONEPE_MERCHANT_ID=
VITE_PHONEPE_SALT_KEY=your_production_salt_key
VITE_PHONEPE_SALT_INDEX=1
VITE_PHONEPE_BASE_URL=https://api.phonepe.com/apis/pg-sandbox

# Firebase Configuration (if needed)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id`;

    fs.writeFileSync(envExamplePath, envExampleContent);
    console.log('✅ Created .env.example file');
  }
  
  console.log('\n📝 To set up production:');
  console.log('1. Copy .env.example to .env');
  console.log('2. Update .env with your production PhonePe credentials');
  console.log('3. Run: cp .env.example .env');
  console.log('4. Edit .env with your actual production values');
}

console.log('\n📋 Production Checklist:');
console.log('□ Set VITE_PHONEPE_MERCHANT_ID to your production merchant ID');
console.log('□ Set VITE_PHONEPE_SALT_KEY to your production salt key');
console.log('□ Set VITE_PHONEPE_SALT_INDEX to your production salt index');
console.log('□ Set VITE_PHONEPE_BASE_URL to production PhonePe API URL');
console.log('□ Test payment flow with production credentials');
console.log('□ Implement proper SHA256 checksum generation');
console.log('□ Remove test mode fallback in production');

console.log('\n📖 See PRODUCTION_SETUP.md for detailed instructions');
console.log('🔗 PhonePe API Docs: https://developer.phonepe.com/');




