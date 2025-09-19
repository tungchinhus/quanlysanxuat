# Fix Popup "Thao tác quấn dây" - Tổ trưởng Access

## Vấn đề đã phát hiện
- User "Tổ trưởng" không thể click mở popup "Thao tác quấn dây"
- Nguyên nhân: Method `hasAdminOrManagerRole()` chỉ kiểm tra role "admin" và "manager"
- Không bao gồm role "totruong"

## Giải pháp đã áp dụng

### 1. Cập nhật ds-bangve.component.ts
**File**: `src/app/components/ds-bangve/ds-bangve.component.ts`
- Cập nhật method `hasAdminOrManagerRole()` để bao gồm role "totruong"
- Cập nhật thông báo lỗi để phản ánh đúng quyền

### 2. Cập nhật gia-cong-popup.component.ts
**File**: `src/app/components/ds-bangve/gia-cong-popup/gia-cong-popup.component.ts`
- Cập nhật method `hasAdminOrManagerRole()` để bao gồm role "totruong"
- Cập nhật thông báo lỗi trong popup

## Logic mới

### Trước (chỉ admin/manager):
```typescript
role.toLowerCase() === 'admin' || 
role.toLowerCase() === 'manager' ||
role.toLowerCase() === 'administrator'
```

### Sau (bao gồm totruong):
```typescript
role.toLowerCase() === 'admin' || 
role.toLowerCase() === 'manager' ||
role.toLowerCase() === 'administrator' ||
role.toLowerCase() === 'totruong'
```

## Cách test

### Bước 1: Clear cache và đăng nhập lại
1. Mở Developer Tools (F12)
2. Clear Local Storage và Session Storage
3. Refresh trang

### Bước 2: Đăng nhập với tài khoản Tổ trưởng
1. Đăng nhập với `totruongquanday@thibidi.com` / `Ab!123456`
2. Truy cập trang "Quản lý bảng vẽ"

### Bước 3: Test popup "Thao tác quấn dây"
1. Trong bảng danh sách bảng vẽ, click vào icon 3 chấm (⋮) ở cột "Thao tác"
2. Click vào "Thao tác quấn dây" trong menu dropdown
3. **Kết quả mong đợi**: Popup "Gia công" sẽ mở ra

### Bước 4: Kiểm tra Console Logs
Trong Console, bạn sẽ thấy:
```
=== hasAdminOrManagerRole check ===
Admin/Manager/Totruong role found in userInfo.roles: true
Final hasAdminOrManagerRole result: true
```

### Bước 5: Test các chức năng khác
1. **Thêm bảng vẽ mới**: Click nút "Thêm mới" - phải hoạt động
2. **Sửa bảng vẽ**: Click icon sửa trong menu - phải hoạt động
3. **Các popup khác**: Tất cả popup liên quan đến gia công - phải hoạt động

## Kết quả mong đợi
- ✅ Popup "Thao tác quấn dây" mở được
- ✅ Popup "Gia công" hiển thị đúng
- ✅ Có thể chọn người gia công
- ✅ Có thể xác nhận gia công
- ✅ Tất cả chức năng quản lý bảng vẽ hoạt động

## Files đã thay đổi
1. `src/app/components/ds-bangve/ds-bangve.component.ts` - Cập nhật hasAdminOrManagerRole()
2. `src/app/components/ds-bangve/gia-cong-popup/gia-cong-popup.component.ts` - Cập nhật hasAdminOrManagerRole()

## Lưu ý
- Role "totruong" giờ đây có quyền tương đương admin/manager trong quản lý bảng vẽ
- Có thể thêm, sửa, gia công bảng vẽ
- Có thể mở tất cả popup liên quan đến quản lý bảng vẽ
