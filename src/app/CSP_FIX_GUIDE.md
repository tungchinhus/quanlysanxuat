# Fix CSP Error - API UserBangVe/multiple

## Vấn đề đã phát hiện
- Lỗi CSP (Content Security Policy) khi gọi API `https://localhost:7190/api/UserBangVe/multiple`
- Browser từ chối kết nối vì CSP không cho phép connect đến localhost:7190
- Ảnh hưởng đến chức năng gán bảng vẽ cho user bối dây hạ và bối dây cao

## Giải pháp đã áp dụng

### 1. Cập nhật CSP trong index.html
**File**: `src/index.html`
- Thêm `https://localhost:7190` và `http://localhost:7190` vào `connect-src` directive
- Cho phép kết nối đến API backend

### 2. Cập nhật CSP trong csp-config.js
**File**: `src/csp-config.js`
- Cập nhật cả development và production CSP
- Thêm localhost:7190 vào cả hai môi trường

## Cấu hình CSP mới

### Trước (bị lỗi):
```html
connect-src 'self' 
  https://www.googleapis.com 
  https://accounts.google.com 
  https://www.gstatic.com 
  https://firebaseapp.com 
  https://*.firebaseapp.com
  https://*.googleapis.com
  https://*.google.com
  https://www.googletagmanager.com
  https://www.google-analytics.com
  https://accounts.google.com/gsi
  https://firestore.googleapis.com
  https://identitytoolkit.googleapis.com;
```

### Sau (đã fix):
```html
connect-src 'self' 
  https://www.googleapis.com 
  https://accounts.google.com 
  https://www.gstatic.com 
  https://firebaseapp.com 
  https://*.firebaseapp.com
  https://*.googleapis.com
  https://*.google.com
  https://www.googletagmanager.com
  https://www.google-analytics.com
  https://accounts.google.com/gsi
  https://firestore.googleapis.com
  https://identitytoolkit.googleapis.com
  https://localhost:7190
  http://localhost:7190;
```

## Cách test

### Bước 1: Restart Development Server
1. Dừng Angular development server (Ctrl+C)
2. Chạy lại `ng serve` hoặc `npm start`
3. Đảm bảo CSP mới được áp dụng

### Bước 2: Clear Browser Cache
1. Mở Developer Tools (F12)
2. Right-click vào refresh button
3. Chọn "Empty Cache and Hard Reload"
4. Hoặc Clear Local Storage và Session Storage

### Bước 3: Test chức năng gán bảng vẽ
1. Đăng nhập với `totruongquanday@thibidi.com` / `Ab!123456`
2. Truy cập "Quản lý bảng vẽ"
3. Click "Thao tác quấn dây" trên một bảng vẽ
4. Chọn người gia công cho bối dây hạ và bối dây cao
5. Click "Xác nhận"

### Bước 4: Kiểm tra Console
Trong Console, bạn sẽ thấy:
- ✅ Không còn lỗi CSP
- ✅ API call thành công: `POST https://localhost:7190/api/UserBangVe/multiple`
- ✅ Response: `UserBangVe records added successfully`

### Bước 5: Kiểm tra Network Tab
1. Mở Network tab trong Developer Tools
2. Thực hiện gán bảng vẽ
3. Tìm request đến `UserBangVe/multiple`
4. Kiểm tra:
   - Status: 200 OK
   - Response: Thành công
   - Không có lỗi CORS hoặc CSP

## Kết quả mong đợi
- ✅ Không còn lỗi CSP trong Console
- ✅ API call đến localhost:7190 thành công
- ✅ Gán bảng vẽ cho user bối dây hạ và bối dây cao hoạt động
- ✅ Popup "Gia công" đóng thành công sau khi xác nhận
- ✅ Thông báo thành công hiển thị

## Files đã thay đổi
1. `src/index.html` - Cập nhật CSP meta tag
2. `src/csp-config.js` - Cập nhật CSP config cho dev và production

## Lưu ý quan trọng
- Cần restart development server để CSP mới có hiệu lực
- CSP chỉ áp dụng cho browser, không ảnh hưởng đến server
- Nếu vẫn gặp lỗi, kiểm tra xem backend API có chạy trên localhost:7190 không
