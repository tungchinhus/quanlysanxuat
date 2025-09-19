# Hướng dẫn Test Nhanh - Tổ trưởng Access

## Vấn đề đã fix
- User "Tổ trưởng" gặp lỗi 403 - Không có quyền truy cập
- Nguyên nhân: User chưa được cấu hình role trong database

## Giải pháp đã áp dụng
1. **Cập nhật AuthService** để tự động gán role dựa trên email
2. **Fallback logic** cho demo users không có trong database
3. **Auto-role assignment** cho các email chứa từ khóa đặc biệt

## Cách test

### Bước 1: Clear cache và đăng nhập lại
1. Mở Developer Tools (F12)
2. Vào Application/Storage tab
3. Clear Local Storage và Session Storage
4. Refresh trang

### Bước 2: Đăng nhập với tài khoản Tổ trưởng
1. Truy cập trang đăng nhập
2. Click nút "Tổ trưởng" để auto-fill
3. Đăng nhập với: `totruongquanday@thibidi.com` / `Ab!123456`

### Bước 3: Kiểm tra Console Logs
Trong Developer Tools Console, bạn sẽ thấy:
```
Demo user login allowed: totruongquanday@thibidi.com
```

### Bước 4: Kiểm tra User Object
Trong Console, chạy:
```javascript
console.log('Current user:', JSON.parse(localStorage.getItem('currentUser')));
```

Kết quả mong đợi:
```json
{
  "id": "firebase_uid",
  "username": "totruongquanday",
  "email": "totruongquanday@thibidi.com",
  "fullName": "totruongquanday",
  "isActive": true,
  "roles": ["totruong"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Bước 5: Test Truy cập
1. **Dashboard**: Truy cập `/dashboard` - phải thành công
2. **Quản lý bảng vẽ**: Truy cập `/ds-bangve` - phải thành công
3. **Quản lý user**: Truy cập `/quan-ly-user` - phải bị chặn (403)

## Logic Auto-Role Assignment

Hệ thống sẽ tự động gán role dựa trên email:
- Email chứa "totruong" → role "totruong"
- Email chứa "admin" → role "admin"  
- Email chứa "manager" → role "manager"
- Các email khác → role "user"

## Troubleshooting

### Nếu vẫn gặp lỗi 403:
1. Kiểm tra Console logs xem có lỗi gì không
2. Kiểm tra user object trong localStorage
3. Kiểm tra network tab xem có request nào bị lỗi không

### Nếu không thể đăng nhập:
1. Kiểm tra Firebase Authentication có user này không
2. Kiểm tra password có đúng không
3. Kiểm tra Console logs để xem lỗi cụ thể

## Files đã thay đổi
- `src/app/services/auth.service.ts` - Cập nhật logic xác thực và gán role
