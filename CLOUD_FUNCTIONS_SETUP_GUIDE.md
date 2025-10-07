# Hướng dẫn Setup Firebase Cloud Functions cho đổi mật khẩu

## 🚨 Vấn đề hiện tại
- Admin đổi mật khẩu cho user bị lỗi CORS và 404
- Cloud Functions chưa được deploy
- URL endpoint không đúng

## ✅ Giải pháp đã áp dụng
1. **Sửa URL endpoint** trong `AdminPasswordService`
2. **Cải thiện fallback logic** để sử dụng `FreePasswordService` khi Cloud Functions không khả dụng
3. **Thêm thông báo lỗi rõ ràng** cho user

## 🔧 Setup Cloud Functions (Tùy chọn)

### Bước 1: Cài đặt Firebase CLI
```bash
npm install -g firebase-tools
```

### Bước 2: Đăng nhập Firebase
```bash
firebase login
```

### Bước 3: Khởi tạo Functions
```bash
firebase init functions
```

### Bước 4: Tạo file functions/index.js
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.changeUserPassword = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { userId, newPassword, adminUserId } = req.body;

    // Validate input
    if (!userId || !newPassword || !adminUserId) {
      res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
      return;
    }

    // Check admin permission (simplified)
    const adminDoc = await admin.firestore().collection('users').doc(adminUserId).get();
    if (!adminDoc.exists) {
      res.status(403).json({
        success: false,
        message: 'Admin không tồn tại'
      });
      return;
    }

    const adminData = adminDoc.data();
    const isAdmin = adminData.roles && adminData.roles.some(role => 
      role.includes('admin') || role.includes('manager')
    );

    if (!isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Không có quyền admin'
      });
      return;
    }

    // Get user data
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'User không tồn tại'
      });
      return;
    }

    const userData = userDoc.data();
    const firebaseUID = userData.uid || userData.firebaseUID || userData.firebase_uid;

    if (!firebaseUID) {
      res.status(400).json({
        success: false,
        message: 'User chưa có Firebase Auth account'
      });
      return;
    }

    // Update password using Admin SDK
    await admin.auth().updateUser(firebaseUID, {
      password: newPassword
    });

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});
```

### Bước 5: Cài đặt dependencies
```bash
cd functions
npm install firebase-functions firebase-admin
```

### Bước 6: Deploy Functions
```bash
firebase deploy --only functions
```

### Bước 7: Test Functions
```bash
# Test changeUserPassword
curl -X POST https://us-central1-quanlysanxuat.cloudfunctions.net/changeUserPassword \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "newPassword": "NewPassword123!",
    "adminUserId": "admin-user-id"
  }'
```

## 🎯 Kết quả mong đợi
- ✅ Cloud Functions hoạt động bình thường
- ✅ Admin có thể đổi mật khẩu cho user
- ✅ Không còn lỗi CORS và 404
- ✅ Fallback vẫn hoạt động nếu có vấn đề

## 🔄 Fallback hiện tại
Nếu Cloud Functions không khả dụng, hệ thống sẽ tự động chuyển sang sử dụng `FreePasswordService`:
- Tạo Firebase Auth account mới cho user
- Hoặc cập nhật mật khẩu nếu user đã có account
- Hiển thị thông báo phù hợp cho user

## 📝 Lưu ý
- Cloud Functions cần billing account để hoạt động
- FreePasswordService hoạt động miễn phí nhưng có giới hạn
- Nên sử dụng Cloud Functions cho production
