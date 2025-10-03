# Hướng dẫn cấu hình Firebase Project ID

## Vấn đề hiện tại:
- CSP đã được cập nhật để cho phép kết nối đến Cloud Functions
- Service đã được cập nhật để tự động lấy Project ID từ Firebase config
- Cần đảm bảo Firebase config có Project ID đúng

## Các bước để fix:

### 1. Kiểm tra Firebase config
File: `src/firebase.config.ts` hoặc `src/environments/environment.ts`

Đảm bảo có:
```typescript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id", // ← Đây là quan trọng
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 2. Deploy Cloud Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

### 3. Kiểm tra Functions URL
Sau khi deploy, kiểm tra URL trong Firebase Console:
- Vào Firebase Console → Functions
- Copy URL của function `changeUserPassword`
- URL sẽ có dạng: `https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/changeUserPassword`

### 4. Test kết nối
Mở Developer Console và kiểm tra:
- Service sẽ log: `Cloud Functions URL: https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net`
- Không còn lỗi CSP
- Có thể gọi Cloud Functions thành công

### 5. Troubleshooting

#### Nếu vẫn có lỗi CSP:
- Hard refresh browser (Ctrl+F5)
- Clear browser cache
- Kiểm tra lại CSP trong `src/index.html`

#### Nếu có lỗi 404:
- Kiểm tra function đã deploy chưa
- Kiểm tra Project ID có đúng không
- Kiểm tra function name có đúng không

#### Nếu có lỗi CORS:
- Cloud Functions đã có CORS headers
- Kiểm tra browser network tab để xem response

## Lưu ý quan trọng:
- Thay `YOUR-PROJECT-ID` bằng Project ID thực tế
- Đảm bảo Cloud Functions đã được deploy
- Kiểm tra Firebase Console để xác nhận functions đang chạy
