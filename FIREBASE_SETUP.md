# Hướng dẫn cấu hình Firebase Database

## 1. Cài đặt Firebase CLI

```bash
npm install -g firebase-tools
```

## 2. Đăng nhập Firebase

```bash
firebase login
```

## 3. Khởi tạo dự án Firebase

```bash
firebase init
```

Chọn:
- Firestore
- Hosting
- Functions (tùy chọn)

## 4. Cấu hình Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào Project Settings > General > Your apps
4. Thêm web app và copy cấu hình

## 5. Cập nhật file environment

Cập nhật file `src/environments/environment.ts` và `src/environments/environment.prod.ts` với thông tin project của bạn:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "your-api-key-here",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
  }
};
```

## 6. Cấu trúc Database

Dự án đã được cấu hình để sử dụng các collection sau:

- `tbl_bangve` - Bảng vẽ
- `tbl_bd_cao` - Bộ dây cao
- `tbl_bd_ha` - Bộ dây hạ
- `tbl_ep_boiday` - Ép bối dây
- `tbl_kcs_approve` - Phê duyệt KCS
- `tbl_user_bangve` - User bảng vẽ

## 7. Sử dụng Firebase Service

```typescript
import { FirebaseService } from './services/firebase.service';

constructor(private firebaseService: FirebaseService) {}

// Lấy danh sách bảng vẽ
this.firebaseService.getBangVeList().subscribe(bangVeList => {
  console.log(bangVeList);
});

// Thêm bảng vẽ mới
this.firebaseService.addBangVe({
  kyhieubangve: 'BV001',
  congsuat: 100,
  // ... các field khác
}).then(docRef => {
  console.log('Document written with ID: ', docRef.id);
});
```

## 8. Deploy lên Firebase

```bash
# Build dự án
ng build --configuration production

# Deploy
firebase deploy
```

## 9. Cấu hình Security Rules

File `firestore.rules` đã được tạo với quy tắc cơ bản. Bạn nên tùy chỉnh theo nhu cầu bảo mật của dự án.

## 10. Cấu hình Indexes

File `firestore.indexes.json` đã được tạo với các index cần thiết cho các query phổ biến.

## Lưu ý

- Đảm bảo cập nhật thông tin Firebase project trong file environment
- Kiểm tra và tùy chỉnh Security Rules phù hợp với yêu cầu bảo mật
- Test kỹ các chức năng CRUD trước khi deploy production
