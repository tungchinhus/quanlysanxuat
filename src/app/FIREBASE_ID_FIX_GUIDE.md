# Fix Firebase Document ID Error - Gán User Bối Dây

## Vấn đề đã phát hiện
- Firebase trả về lỗi "No document to update: `projects/quanlysanxuat/databases/(default)/documents/bangve/2`"
- Document ID trong Firebase là string (tự động tạo), nhưng code đang sử dụng number
- Cần đồng bộ cách xử lý ID giữa Firebase và frontend

## Giải pháp đã áp dụng

### 1. Cập nhật Interface BangVeData
**File**: `src/app/components/ds-bangve/ds-bangve.component.ts`
```typescript
export interface BangVeData {
  id: number | string; // Thay đổi từ number thành number | string
  // ... other fields
}
```

### 2. Cập nhật Firebase Service
**File**: `src/app/services/firebase-bangve.service.ts`
- Sử dụng `doc.id` trực tiếp thay vì `parseInt(doc.id)`
- Giữ nguyên string ID từ Firebase

### 3. Cập nhật tất cả methods xử lý ID
**Files**: `src/app/components/ds-bangve/ds-bangve.component.ts`
- `updateDrawing()` - Xử lý ID đúng cách
- `updateDrawingStatus()` - Chấp nhận string | number
- `updateDrawingStatusToInProgress()` - Chấp nhận string | number
- `updateDrawingStatusToInProgressInBackend()` - Chấp nhận string | number
- `verifyDrawingStatusUpdate()` - Chấp nhận string | number
- `moveDrawingToInProgress()` - Chấp nhận string | number
- `deleteDrawing()` - Chấp nhận string | number
- `processDrawingApi()` - Chấp nhận string | number

### 4. Cập nhật GiaCongPopup
**File**: `src/app/components/ds-bangve/gia-cong-popup/gia-cong-popup.component.ts`
- Xử lý `bangveId` đúng cách với string | number

## Cách test

### Bước 1: Restart Development Server
1. Dừng Angular development server (Ctrl+C)
2. Chạy lại `ng serve` hoặc `npm start`
3. Clear browser cache (Hard reload)

### Bước 2: Test chức năng gán user
1. **Đăng nhập** với `totruongquanday@thibidi.com` / `Ab!123456`
2. **Truy cập** "Quản lý bảng vẽ"
3. **Click** "Thao tác quấn dây" trên một bảng vẽ
4. **Chọn** người gia công cho bối dây hạ và bối dây cao
5. **Click** "Xác nhận"

### Bước 3: Kiểm tra Console Logs
Trong Console, bạn sẽ thấy:
```
Creating multiple user_bangve records: [array of data]
Creating user_bangve with data: {bangve_id: "firebase_doc_id", user_id: X, khau_sx: 'bd_ha', ...}
UserBangVe created with ID: [firebase_doc_id]
UserBangVe records added successfully to Firebase: [array of doc_ids]
```

### Bước 4: Kiểm tra Firebase Console
1. Truy cập Firebase Console
2. Vào Firestore Database
3. Tìm collection `user_bangve`
4. Kiểm tra documents mới được tạo với:
   - `bangve_id`: String ID của bảng vẽ (không phải number)
   - `user_id`: ID của user được gán
   - `khau_sx`: 'bd_ha' hoặc 'bd_cao'
   - `trang_thai`: 1 (đang xử lý)

### Bước 5: Kiểm tra không còn lỗi
- **Không còn** lỗi "No document to update"
- **Không còn** lỗi 404 từ API
- **Không còn** lỗi Firebase document not found

## Kết quả mong đợi
- ✅ Không còn lỗi Firebase document ID
- ✅ Dữ liệu được lưu thành công vào Firebase
- ✅ Popup đóng thành công sau khi xác nhận
- ✅ Thông báo thành công hiển thị
- ✅ Dữ liệu xuất hiện trong Firebase Console với đúng format ID

## Files đã thay đổi
1. `src/app/components/ds-bangve/ds-bangve.component.ts` - Cập nhật interface và methods
2. `src/app/services/firebase-bangve.service.ts` - Sửa cách xử lý ID
3. `src/app/components/ds-bangve/gia-cong-popup/gia-cong-popup.component.ts` - Xử lý ID đúng cách

## Lưu ý quan trọng
- Firebase document ID luôn là string
- Code cần xử lý cả string và number ID để tương thích
- Tất cả methods liên quan đến ID đã được cập nhật
- Không cần thay đổi gì trong Firebase Console
