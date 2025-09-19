# Fix 404 Error - Lưu UserBangVe lên Firebase

## Vấn đề đã phát hiện
- API endpoint `https://localhost:7190/api/UserBangVe/multiple` trả về lỗi 404
- Backend API không tồn tại hoặc không chạy
- Cần lưu dữ liệu trực tiếp lên Firebase Database thay vì gọi API

## Giải pháp đã áp dụng

### 1. Tạo Firebase Service cho UserBangVe
**File**: `src/app/services/firebase-user-bangve.service.ts`
- Service mới để quản lý collection `user_bangve` trong Firebase
- Các methods: create, createMultiple, get, update, delete
- Tương thích với interface `UserBangVeData` hiện có

### 2. Cập nhật GiaCongPopup Component
**File**: `src/app/components/ds-bangve/gia-cong-popup/gia-cong-popup.component.ts`
- Thay thế API call bằng Firebase service
- Sử dụng `firebaseUserBangVeService.createMultipleUserBangVe()`
- Xử lý Promise thay vì Observable

### 3. Cập nhật Firestore Rules
**File**: `firestore.rules`
- Thêm rules cho collection `user_bangve`
- Cho phép admin, manager, totruong đọc/ghi

## Cấu trúc dữ liệu UserBangVe trong Firebase

```typescript
interface UserBangVeData {
  id?: number;
  bangve_id: number;        // ID của bảng vẽ
  user_id: number;          // ID của user được gán
  khau_sx: string;          // 'bd_ha' hoặc 'bd_cao'
  trang_thai: number;       // 1 = đang xử lý, 2 = đã hoàn thành
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
  status?: boolean;         // true = active, false = inactive
}
```

## Cách test

### Bước 1: Restart Development Server
1. Dừng Angular development server (Ctrl+C)
2. Chạy lại `ng serve` hoặc `npm start`
3. Đảm bảo Firebase service mới được load

### Bước 2: Clear Browser Cache
1. Mở Developer Tools (F12)
2. Clear Local Storage và Session Storage
3. Hard reload trang

### Bước 3: Test chức năng gán bảng vẽ
1. Đăng nhập với `totruongquanday@thibidi.com` / `Ab!123456`
2. Truy cập "Quản lý bảng vẽ"
3. Click "Thao tác quấn dây" trên một bảng vẽ
4. Chọn người gia công cho bối dây hạ và bối dây cao
5. Click "Xác nhận"

### Bước 4: Kiểm tra Console Logs
Trong Console, bạn sẽ thấy:
```
Creating multiple user_bangve records: [array of data]
Creating user_bangve with data: {bangve_id: X, user_id: Y, khau_sx: 'bd_ha', ...}
UserBangVe created with ID: [firebase_doc_id]
UserBangVe records added successfully to Firebase: [array of doc_ids]
```

### Bước 5: Kiểm tra Firebase Console
1. Truy cập Firebase Console
2. Vào Firestore Database
3. Tìm collection `user_bangve`
4. Kiểm tra documents mới được tạo với:
   - `bangve_id`: ID của bảng vẽ
   - `user_id`: ID của user được gán
   - `khau_sx`: 'bd_ha' hoặc 'bd_cao'
   - `trang_thai`: 1 (đang xử lý)

### Bước 6: Kiểm tra Network Tab
1. Mở Network tab trong Developer Tools
2. Thực hiện gán bảng vẽ
3. **Không còn** request đến `localhost:7190`
4. Chỉ có requests đến Firebase (firestore.googleapis.com)

## Kết quả mong đợi
- ✅ Không còn lỗi 404
- ✅ Dữ liệu được lưu thành công vào Firebase
- ✅ Popup đóng thành công sau khi xác nhận
- ✅ Thông báo thành công hiển thị
- ✅ Dữ liệu xuất hiện trong Firebase Console

## Files đã thay đổi
1. `src/app/services/firebase-user-bangve.service.ts` - Service mới cho Firebase
2. `src/app/components/ds-bangve/gia-cong-popup/gia-cong-popup.component.ts` - Cập nhật để dùng Firebase
3. `firestore.rules` - Thêm rules cho user_bangve collection

## Lưu ý quan trọng
- Không cần backend API nữa cho chức năng này
- Tất cả dữ liệu được lưu trực tiếp vào Firebase
- Cần deploy Firestore rules nếu chưa deploy
- Firebase service tự động tạo collection khi cần
