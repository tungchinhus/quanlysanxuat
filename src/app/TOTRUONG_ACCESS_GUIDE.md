# Hướng dẫn Cấu hình Quyền Truy cập cho Tổ trưởng

## Tổng quan
Đã cập nhật hệ thống để cho phép user có role "tổ trưởng" (totruong) truy cập vào dashboard và quản lý bảng vẽ.

## Các thay đổi đã thực hiện

### 1. Thêm Role "totruong" vào hệ thống
- **File**: `src/app/models/user.model.ts`
- **Thay đổi**: Thêm `TOTRUONG: 'totruong'` vào `PREDEFINED_ROLES`
- **Thêm permissions**: Thêm các permissions cho module bảng vẽ (BANG_VE)

### 2. Cập nhật Routes
- **File**: `src/app/app.routes.ts`
- **Dashboard route**: Thêm 'totruong' vào danh sách roles được phép truy cập
- **DS-Bangve route**: Thêm 'totruong' vào danh sách roles được phép truy cập

### 3. Cập nhật Data Initialization
- **File**: `src/app/services/data-initialization.service.ts`
- **Thêm role totruong**: Với permissions cho dashboard, bảng vẽ và báo cáo
- **Permissions**: Xem, tạo, sửa bảng vẽ; xem dashboard và báo cáo

### 4. Cập nhật Firestore Rules
- **File**: `firestore.rules`
- **Thêm function isTotruong()**: Kiểm tra role tổ trưởng
- **Cập nhật rules**: Cho phép tổ trưởng truy cập collections bangve và drawings

## Cấu hình User Tổ trưởng

### Bước 1: Tạo User trong Firebase
1. Truy cập Firebase Console
2. Vào Authentication > Users
3. Thêm user mới với email: `totruongquanday@thibidi.com`
4. Đặt password: `Ab!123456`

### Bước 2: Cấu hình Role trong Firestore
1. Truy cập Firestore Database
2. Vào collection `users`
3. Tạo document với ID là UID của user
4. Thêm dữ liệu:
```json
{
  "id": "UID_FROM_FIREBASE_AUTH",
  "username": "totruongquanday",
  "email": "totruongquanday@thibidi.com",
  "fullName": "Tổ trưởng Quấn dây",
  "phone": "0901234567",
  "department": "Sản xuất",
  "position": "Tổ trưởng",
  "khau_sx": "quanday",
  "isActive": true,
  "roles": ["totruong"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": null,
  "createdBy": "admin",
  "updatedBy": "admin"
}
```

### Bước 3: Khởi tạo Role và Permissions
1. Chạy Data Initialization Service để tạo role "totruong" và permissions
2. Hoặc tạo thủ công trong Firestore:
   - Collection `roles`: Tạo role "totruong"
   - Collection `permissions`: Tạo các permissions cho bảng vẽ

## Test Quyền Truy cập

### Test 1: Đăng nhập
1. Truy cập trang đăng nhập
2. Click nút "Tổ trưởng" để auto-fill thông tin
3. Đăng nhập với: `totruongquanday@thibidi.com` / `Ab!123456`
4. **Kết quả mong đợi**: Đăng nhập thành công và chuyển hướng đến dashboard

### Test 2: Truy cập Dashboard
1. Sau khi đăng nhập, kiểm tra xem có thể truy cập `/dashboard`
2. **Kết quả mong đợi**: Có thể xem dashboard mà không bị chuyển hướng đến unauthorized

### Test 3: Truy cập Quản lý Bảng vẽ
1. Truy cập `/ds-bangve`
2. **Kết quả mong đợi**: Có thể xem danh sách bảng vẽ
3. Kiểm tra các chức năng:
   - Xem bảng vẽ
   - Tạo bảng vẽ mới
   - Sửa bảng vẽ
   - Xuất bảng vẽ

### Test 4: Kiểm tra Quyền hạn chế
1. Thử truy cập các trang không được phép:
   - `/quan-ly-user` (chỉ admin)
   - `/quan-ly-phan-quyen` (chỉ admin)
2. **Kết quả mong đợi**: Bị chuyển hướng đến `/unauthorized`

## Troubleshooting

### Lỗi 1: User không thể đăng nhập
- **Nguyên nhân**: User chưa được tạo trong Firebase Authentication
- **Giải pháp**: Tạo user trong Firebase Console

### Lỗi 2: Đăng nhập thành công nhưng không thể truy cập dashboard
- **Nguyên nhân**: User chưa có role "totruong" trong Firestore
- **Giải pháp**: Cấu hình role cho user trong Firestore

### Lỗi 3: Có thể truy cập dashboard nhưng không thể truy cập ds-bangve
- **Nguyên nhân**: Role "totruong" chưa có permission "drawing_view"
- **Giải pháp**: Chạy Data Initialization Service hoặc cấu hình permissions thủ công

### Lỗi 4: Lỗi Firestore permission denied
- **Nguyên nhân**: Firestore rules chưa được cập nhật
- **Giải pháp**: Deploy lại firestore.rules

## Cấu trúc Role "totruong"

### Permissions được cấp:
- `dashboard_view`: Xem dashboard
- `drawing_view`: Xem bảng vẽ
- `drawing_create`: Tạo bảng vẽ
- `drawing_update`: Sửa bảng vẽ
- `drawing_export`: Xuất bảng vẽ
- `report_view`: Xem báo cáo

### Permissions KHÔNG được cấp:
- Quản lý user (`user_view`, `user_create`, etc.)
- Quản lý role (`role_view`, `role_create`, etc.)
- Cài đặt hệ thống (`system_config`)

## Lưu ý quan trọng

1. **Firebase Authentication**: User phải được tạo trong Firebase Authentication
2. **Firestore User Document**: User phải có document trong collection `users` với role "totruong"
3. **Firestore Rules**: Phải deploy lại rules sau khi cập nhật
4. **Data Initialization**: Chạy service khởi tạo để tạo role và permissions

## Các file đã thay đổi

1. `src/app/models/user.model.ts` - Thêm role và permissions
2. `src/app/app.routes.ts` - Cập nhật routes
3. `src/app/services/data-initialization.service.ts` - Thêm role totruong
4. `firestore.rules` - Cập nhật rules cho tổ trưởng
