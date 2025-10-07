# Debug Guide: Gia-Cong-Popup Not Opening

## Vấn đề đã được khắc phục

Tôi đã thêm debug logging vào cả hai component để xác định nguyên nhân popup không mở được:

### 1. Debug Logging đã thêm:

#### Trong `ds-bangve.component.ts`:
- Log khi `onGiaCong()` được gọi
- Log thông tin drawing data
- Log kết quả kiểm tra quyền (`hasPermission`)
- Log khi dialog được mở thành công
- Log chi tiết quyền từ `hasAdminOrManagerRole()`

#### Trong `gia-cong-popup.component.ts`:
- Log khi `ngOnInit()` được gọi
- Log data nhận được
- Log kết quả kiểm tra quyền
- Log khi data không hợp lệ
- Log chi tiết quyền từ `hasAdminOrManagerRole()`

### 2. Cách debug:

#### Bước 1: Mở Developer Tools
1. Mở trình duyệt tại `http://localhost:4200`
2. Nhấn `F12` để mở Developer Tools
3. Vào tab **Console**

#### Bước 2: Test chức năng
1. Đăng nhập với tài khoản admin/manager
2. Vào trang "Danh sách bảng vẽ"
3. Click vào nút "Thao tác quấn dây" (icon build) của một bảng vẽ
4. Quan sát console logs

#### Bước 3: Phân tích logs

**Nếu popup không mở, kiểm tra:**

1. **Log từ ds-bangve component:**
   ```
   onGiaCong called with drawing: [object]
   hasPermission: true/false
   Opening dialog with data: [object]
   Dialog opened successfully
   ```

2. **Log từ gia-cong-popup component:**
   ```
   GiaCongPopupComponent ngOnInit called
   Data received: [object]
   hasPermission: true/false
   Data is valid, loading workers
   ```

### 3. Các nguyên nhân có thể:

#### A. Vấn đề quyền truy cập:
- `hasPermission: false` → User không có quyền admin/manager
- Kiểm tra localStorage có `role: 'admin'` hoặc `role: 'manager'`

#### B. Vấn đề data:
- `Invalid data, closing dialog` → Data drawing không hợp lệ
- Kiểm tra drawing object có đầy đủ thông tin không

#### C. Vấn đề CSP:
- Lỗi CSP trong Console → Đã được fix trong `src/index.html`

#### D. Vấn đề Angular Material:
- Lỗi import MatDialogModule → Đã được kiểm tra và OK

### 4. Các bước khắc phục:

#### Nếu không có quyền:
```javascript
// Trong Console, chạy:
localStorage.setItem('role', 'admin');
// Hoặc
localStorage.setItem('userRole', 'admin');
```

#### Nếu data không hợp lệ:
- Kiểm tra drawing object có đầy đủ fields không
- Đảm bảo `drawing.id` không null/undefined

#### Nếu vẫn không mở:
1. Hard refresh: `Ctrl + Shift + R`
2. Clear browser cache
3. Restart development server

### 5. Test Cases:

#### Test Case 1: Admin User
- Login với admin account
- Click "Thao tác quấn dây"
- Popup should open

#### Test Case 2: Manager User  
- Login với manager account
- Click "Thao tác quấn dây"
- Popup should open

#### Test Case 3: Regular User
- Login với user thường
- Click "Thao tác quấn dây"
- Should redirect based on khau_sx

### 6. Expected Console Output:

**Khi popup mở thành công:**
```
onGiaCong called with drawing: {id: "123", kyhieubangve: "ABC", ...}
hasPermission: true
Opening dialog with data: {drawing: {...}}
Dialog opened successfully
GiaCongPopupComponent ngOnInit called
Data received: {drawing: {...}}
hasPermission: true
Data is valid, loading workers
```

**Khi không có quyền:**
```
onGiaCong called with drawing: {...}
hasPermission: false
No permission, redirecting based on khau_sx
```

**Khi data không hợp lệ:**
```
GiaCongPopupComponent ngOnInit called
Data received: null
Invalid data, closing dialog
```

## Liên hệ:
Nếu vẫn gặp vấn đề sau khi follow hướng dẫn này, hãy:
1. Copy toàn bộ console logs
2. Mô tả steps bạn đã thực hiện
3. Cho biết user role hiện tại
