# Hướng dẫn giải quyết lỗi "Missing or insufficient permissions" khi approve KCS

## Vấn đề
Lỗi "Missing or insufficient permissions" xảy ra khi cố gắng tạo KCS approval trong Firebase Firestore. Nguyên nhân chính là:

1. **Người dùng hiện tại không có role `kcs`** trong Firestore
2. **Firestore rules yêu cầu role `kcs`** để tạo KCS approval
3. **Có sự không khớp** giữa cách kiểm tra quyền trong frontend và Firestore rules

## Giải pháp

### Bước 1: Kiểm tra người dùng hiện tại
Chạy script để kiểm tra roles của người dùng hiện tại:

```bash
node check-current-user-kcs.js
```

### Bước 2: Cập nhật roles cho người dùng
Chạy script để thêm role `kcs` cho tất cả người dùng:

```bash
node update-users-with-kcs-role.js
```

### Bước 3: Tạo người dùng KCS chuyên dụng
Script trên sẽ tự động tạo người dùng KCS chuyên dụng với thông tin:
- **Email**: `kcs@thibidi.com`
- **Password**: `Kcs123!@#`
- **Username**: `kcs_user`

### Bước 4: Test quyền KCS
Mở Developer Console trong trình duyệt và chạy:

```javascript
// Load test script
const script = document.createElement('script');
script.src = 'test-kcs-permissions.js';
document.head.appendChild(script);

// Chạy tests
runKcsTests();
```

### Bước 5: Deploy Firestore rules
Sau khi cập nhật roles, deploy Firestore rules:

```bash
firebase deploy --only firestore:rules
```

## Cấu trúc Firestore Rules

Rules hiện tại cho collection `kcs_approve`:

```javascript
match /kcs_approve/{document} {
  allow read: if isAuthenticated() && (isKcs() || isAdmin() || isSuperAdmin() || isManager());
  allow create: if isAuthenticated() && (isKcs() || isAdmin() || isSuperAdmin() || isManager());
  allow update: if isAuthenticated() && (isKcs() || isAdmin() || isSuperAdmin() || isManager());
  allow delete: if isAuthenticated() && (isAdmin() || isSuperAdmin());
}
```

## Kiểm tra quyền trong Frontend

Component `KcsCheckComponent` kiểm tra quyền KCS bằng cách:

1. **Kiểm tra roles array** - tìm role chứa 'kcs'
2. **Kiểm tra email** - tìm email chứa 'kcs'  
3. **Kiểm tra khau_sx** - tìm khau_sx chứa 'kcs'

## Troubleshooting

### Nếu vẫn gặp lỗi permission:

1. **Kiểm tra Firebase Auth**: Đảm bảo người dùng đã đăng nhập
2. **Kiểm tra Firestore document**: Đảm bảo user document tồn tại với roles array
3. **Kiểm tra role format**: Roles phải là array chứa string 'kcs'
4. **Clear cache**: Xóa localStorage và đăng nhập lại

### Debug commands:

```javascript
// Kiểm tra user hiện tại
console.log('Current user:', JSON.parse(localStorage.getItem('currentUser')));

// Kiểm tra Firebase Auth
console.log('Firebase user:', firebase.auth().currentUser);

// Test KCS approval
testKcsApproval();
```

## Files đã tạo

1. `check-current-user-kcs.js` - Kiểm tra roles người dùng
2. `update-users-with-kcs-role.js` - Cập nhật roles cho người dùng
3. `create-kcs-user-with-permissions.js` - Tạo người dùng KCS mới
4. `test-kcs-permissions.js` - Test quyền KCS trong browser

## Lưu ý quan trọng

- **Service Account Key**: Cần download `serviceAccountKey.json` từ Firebase Console
- **Firebase Project**: Đảm bảo projectId đúng là `quanlysanxuat`
- **Roles Format**: Roles phải là array, không phải string
- **Case Sensitivity**: Roles không phân biệt hoa thường trong frontend nhưng Firestore rules có thể phân biệt


