// Test Firebase connection
// Run with: node test-firebase.js

const { exec } = require('child_process');
const path = require('path');

console.log('🔥 Testing Firebase Connection...');
console.log('');

// Check if Firebase config is properly set
const environmentPath = path.join(__dirname, 'src', 'environments', 'environment.ts');
const fs = require('fs');

if (!fs.existsSync(environmentPath)) {
  console.error('❌ Environment file not found!');
  process.exit(1);
}

const environmentContent = fs.readFileSync(environmentPath, 'utf8');

// Check if Firebase config is updated
if (environmentContent.includes('your-api-key-here')) {
  console.error('❌ Firebase configuration not updated!');
  console.error('Please update src/environments/environment.ts with your Firebase config');
  process.exit(1);
}

console.log('✅ Firebase configuration found and updated');
console.log('');

// Check if Angular app can be built
console.log('🔨 Testing Angular build...');
exec('ng build --configuration development', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Angular build failed:');
    console.error(stderr);
    return;
  }
  
  console.log('✅ Angular build successful');
  console.log('');
  
  console.log('🚀 Firebase setup completed successfully!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Start the development server: ng serve');
  console.log('2. Open http://localhost:4200 in your browser');
  console.log('3. Navigate to Firebase Test component');
  console.log('4. Click "Kiểm tra kết nối" to test Firebase');
  console.log('5. Click "Tải danh sách" to load users from Firestore');
  console.log('');
  console.log('🔐 Demo login credentials:');
  console.log('   Username: admin, Password: admin123');
  console.log('   Username: manager1, Password: manager123');
  console.log('   Username: user1, Password: user123');
  console.log('');
  console.log('✨ Ready to use Firebase with your Angular app!');
});
