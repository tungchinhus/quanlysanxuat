# Hướng dẫn Deploy Firebase Cloud Functions

## 1. Cài đặt Firebase CLI
```bash
npm install -g firebase-tools
```

## 2. Đăng nhập Firebase
```bash
firebase login
```

## 3. Khởi tạo Firebase project (nếu chưa có)
```bash
firebase init functions
```

## 4. Cài đặt dependencies
```bash
cd functions
npm install
```

## 5. Cập nhật Project ID
Trong file `src/app/services/admin-password.service.ts`, thay đổi:
```typescript
private readonly FUNCTIONS_URL = 'https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net';
```

## 6. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

## 7. Kiểm tra Functions đã deploy
```bash
firebase functions:list
```

## 8. Test Functions
```bash
# Test changeUserPassword
curl -X POST https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/changeUserPassword \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "newPassword": "NewPassword123!",
    "adminUserId": "admin-user-id"
  }'

# Test checkAdminPermission
curl https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/checkAdminPermission/admin-user-id
```

## 9. Cấu hình Firebase Project
Đảm bảo trong Firebase Console:
- Authentication đã được enable
- Firestore Database đã được tạo
- Cloud Functions đã được enable
- Service Account có quyền Admin SDK

## 10. Troubleshooting
- Kiểm tra logs: `firebase functions:log`
- Kiểm tra permissions trong Firebase Console
- Đảm bảo CORS được cấu hình đúng
- Kiểm tra network connectivity

## Lưu ý quan trọng:
- Thay `YOUR-PROJECT-ID` bằng Project ID thực tế
- Đảm bảo admin user có role 'admin' hoặc 'manager' trong Firestore
- Test với user có Firebase UID hợp lệ
- Cloud Functions cần billing account để hoạt động
