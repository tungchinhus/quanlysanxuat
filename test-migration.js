// Test migration script
// Run with: node test-migration.js

const { exec } = require('child_process');
const path = require('path');

console.log('🔥 Testing Firebase Migration...');
console.log('');

// Check if @types/node is installed
const packageJsonPath = path.join(__dirname, 'package.json');
const fs = require('fs');

if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const hasNodeTypes = packageJson.devDependencies && packageJson.devDependencies['@types/node'];
  
  if (hasNodeTypes) {
    console.log('✅ @types/node is installed');
  } else {
    console.log('⚠️  @types/node not found in devDependencies');
    console.log('   Run: npm i --save-dev @types/node');
  }
} else {
  console.log('❌ package.json not found');
}

console.log('');

// Check Firebase configuration
const environmentPath = path.join(__dirname, 'src', 'environments', 'environment.ts');
if (fs.existsSync(environmentPath)) {
  const environmentContent = fs.readFileSync(environmentPath, 'utf8');
  
  if (environmentContent.includes('quanlysanxuat')) {
    console.log('✅ Firebase configuration is updated');
    console.log('   Project ID: quanlysanxuat');
  } else {
    console.log('❌ Firebase configuration needs update');
  }
} else {
  console.log('❌ Environment file not found');
}

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
  
  console.log('🚀 Migration test completed!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Start the development server: ng serve');
  console.log('2. Open http://localhost:4200 in your browser');
  console.log('3. Navigate to Firebase Test component');
  console.log('4. Click "Tạo demo users" to create sample users');
  console.log('5. Click "Tải danh sách" to view users');
  console.log('6. Test login with demo credentials');
  console.log('');
  console.log('🔐 Demo login credentials:');
  console.log('   Username: admin, Password: admin123');
  console.log('   Username: manager1, Password: manager123');
  console.log('   Username: user1, Password: user123');
  console.log('');
  console.log('✨ Ready to use Firebase migration!');
});
