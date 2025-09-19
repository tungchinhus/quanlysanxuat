# Fix Case Sensitivity - Role TOTRUONG vs totruong

## Vấn đề đã phát hiện
- Debug hiển thị user có role `['TOTRUONG']` (chữ hoa)
- Routes và AuthGuard kiểm tra role `'totruong'` (chữ thường)
- Dẫn đến lỗi 403 mặc dù user có role đúng

## Giải pháp đã áp dụng
**File**: `src/app/guards/auth.guard.ts`
- Cập nhật logic so sánh role để case insensitive
- Thay đổi từ `roles.includes(roleName)` 
- Thành `roles.some(requiredRole => roleName.toLowerCase() === requiredRole.toLowerCase())`

## Cách test

### Bước 1: Clear cache và đăng nhập lại
1. Mở Developer Tools (F12)
2. Clear Local Storage và Session Storage
3. Refresh trang

### Bước 2: Đăng nhập và kiểm tra
1. Đăng nhập với `totruongquanday@thibidi.com` / `Ab!123456`
2. Trong Console, kiểm tra user object:
```javascript
console.log('User roles:', JSON.parse(localStorage.getItem('currentUser')).roles);
```

### Bước 3: Kiểm tra Console Logs
Trong Console, bạn sẽ thấy:
```
Checking role: TOTRUONG against required roles: ['admin', 'manager', 'user', 'totruong']
Has required role: true
```

### Bước 4: Test Truy cập
1. **Dashboard**: Truy cập `/dashboard` - phải thành công
2. **Quản lý bảng vẽ**: Truy cập `/ds-bangve` - phải thành công

## Logic so sánh mới
```typescript
// Cũ (case sensitive)
return roles.includes(roleName);

// Mới (case insensitive)
return roles.some(requiredRole => 
  roleName.toLowerCase() === requiredRole.toLowerCase()
);
```

## Kết quả mong đợi
- ✅ Role `TOTRUONG` sẽ match với `totruong` trong routes
- ✅ User có thể truy cập dashboard và quản lý bảng vẽ
- ✅ Không còn lỗi 403

## Files đã thay đổi
- `src/app/guards/auth.guard.ts` - Cập nhật logic so sánh role case insensitive
