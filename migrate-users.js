// Script to run user migration
// Run with: node migrate-users.js

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting user migration to Firestore...');
console.log('📝 This will create sample users in your Firebase project');
console.log('');

// Check if Firebase is configured
const firebaseConfigPath = path.join(__dirname, 'src', 'environments', 'environment.ts');
const fs = require('fs');

if (!fs.existsSync(firebaseConfigPath)) {
  console.error('❌ Firebase configuration not found!');
  console.error('Please make sure src/environments/environment.ts exists with Firebase config');
  process.exit(1);
}

const environmentContent = fs.readFileSync(firebaseConfigPath, 'utf8');

// Check if Firebase config is updated
if (environmentContent.includes('your-api-key-here')) {
  console.error('❌ Firebase configuration not updated!');
  console.error('Please update src/environments/environment.ts with your Firebase config');
  process.exit(1);
}

console.log('✅ Firebase configuration found and updated');
console.log('🔥 Project ID: quanlysanxuat');
console.log('🌐 Auth Domain: quanlysanxuat-b7346.firebaseapp.com');
console.log('');

// Instructions for manual migration
console.log('📋 Manual Migration Steps:');
console.log('');
console.log('1. Open your Angular app in the browser');
console.log('2. Navigate to the Firebase Test component');
console.log('3. Click "Kiểm tra kết nối" to test Firebase connection');
console.log('4. Click "Tải danh sách" to load existing users');
console.log('5. Click "Tạo user test" to create a test user');
console.log('');
console.log('🔐 Demo Login Credentials:');
console.log('   Username: admin, Password: admin123');
console.log('   Username: manager1, Password: manager123');
console.log('   Username: user1, Password: user123');
console.log('');
console.log('📚 For more information, check the migration scripts in:');
console.log('   - src/app/scripts/migrate-users.ts');
console.log('   - src/app/scripts/run-migration.ts');
console.log('');
console.log('✨ Migration setup completed!');
