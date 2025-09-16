# 🔥 Firebase Migration Guide

## Cấu hình Firebase đã được cập nhật

Firebase configuration đã được cập nhật với thông tin từ Firebase Console:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyAuIT3ZuNI7gz3eQKPnR1uM6M5j7JggkXs",
    authDomain: "quanlysanxuat-b7346.firebaseapp.com",
    projectId: "quanlysanxuat",
    storageBucket: "quanlysanxuat.firebasestorage.app",
    messagingSenderId: "355582229234",
    appId: "1:355582229234:web:d5f4b8efb8b73243936e6b"
  }
};
```

## 🚀 Cách sử dụng

### 1. Khởi động ứng dụng
```bash
ng serve
```

### 2. Truy cập Firebase Test Component
- Mở trình duyệt tại `http://localhost:4200`
- Điều hướng đến Firebase Test component
- Click "Kiểm tra kết nối" để test Firebase
- Click "Tải danh sách" để xem users từ Firestore

### 3. Test đăng nhập
Sử dụng các tài khoản demo:
- **Admin**: `admin` / `admin123`
- **Manager**: `manager1` / `manager123`
- **User**: `user1` / `user123`

## 📋 Tính năng đã được triển khai

### ✅ Firebase Services
- **FirebaseService**: Quản lý CRUD operations cho users
- **AuthService**: Xử lý authentication với Firestore
- **Migration Scripts**: Tạo user mẫu trong Firestore

### ✅ Components
- **Login Component**: Đăng nhập với username/email
- **User Management**: Quản lý users với Material Design
- **Firebase Test**: Test kết nối và quản lý dữ liệu

### ✅ Features
- Đăng nhập bằng username hoặc email
- Quick login với demo accounts
- CRUD operations cho users
- Tìm kiếm và lọc users
- Phân trang và sắp xếp
- Responsive design

## 🔧 Cấu trúc dữ liệu

### User Collection trong Firestore
```typescript
interface User {
  id?: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  createdBy?: string;
  uid?: string; // For username lookup
}
```

### User Roles
- `admin`: Quản trị hệ thống
- `totruong_quanday`: Tổ trưởng quấn dây
- `quanday_ha`: Quấn dây hạ
- `quanday_cao`: Quấn dây cao
- `ep_boiday`: Ép bối dây
- `kcs`: Kiểm tra chất lượng

## 🛠️ Scripts có sẵn

### Test Firebase Connection
```bash
node test-firebase.js
```

### Migration Instructions
```bash
node migrate-users.js
```

## 📱 Giao diện

### Màn hình đăng nhập
- Background gradient tím-xanh
- Form trắng với bo góc
- Input fields với icons
- Checkbox "Ghi nhớ đăng nhập"
- Nút đăng nhập với icon mũi tên
- Demo role buttons (Admin/Manager/User)

### Quản lý User
- Bảng danh sách users với Material Design
- Tìm kiếm và lọc theo role/trạng thái
- Phân trang và sắp xếp
- Actions menu cho mỗi user
- Responsive design cho mobile

## 🔐 Bảo mật

- Firebase Authentication cho đăng nhập
- Firestore Security Rules (cần cấu hình)
- Role-based permissions
- Input validation và error handling

## 📚 Tài liệu tham khảo

- [Firebase Documentation](https://firebase.google.com/docs)
- [Angular Fire](https://github.com/angular/angularfire)
- [Material Design](https://material.angular.io/)

## 🎯 Next Steps

1. Cấu hình Firestore Security Rules
2. Thêm Firebase Hosting
3. Implement real-time updates
4. Thêm push notifications
5. Optimize performance và caching

---

**✨ Firebase migration đã hoàn thành! Ứng dụng sẵn sàng sử dụng với Firestore.**
