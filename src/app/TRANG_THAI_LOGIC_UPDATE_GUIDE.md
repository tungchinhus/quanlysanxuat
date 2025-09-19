# Cập nhật Logic Trang_thai - Từ 3 thành 1

## Vấn đề đã sửa
- Logic cũ sử dụng `trang_thai = 3` (đang xử lý) thay vì `trang_thai = 1`
- Constants không đúng với yêu cầu nghiệp vụ
- Cần cập nhật để phù hợp với quy chuẩn:
  - 0: Mới
  - 1: Đang xử lý
  - 2: Đã hoàn thành

## Giải pháp đã áp dụng

### 1. Cập nhật STATUS Constants
**File**: `src/app/models/common.enum.ts`
```typescript
export enum STATUS {
  NEW = 0,           // Mới
  PROCESSING = 1,    // Đang xử lý
  COMPLETED = 2,     // Đã hoàn thành
  PENDING = 3,       // Chờ duyệt
  APPROVED = 4,      // Đã duyệt
  REJECTED = 5,      // Từ chối
  CANCELLED = 6,     // Hủy bỏ
  PROCESSED = 7      // Đã xử lý (legacy)
}
```

### 2. Cập nhật Logic trong DS-Bangve Component
**File**: `src/app/components/ds-bangve/ds-bangve.component.ts`
- Thay thế hard-coded số 1 bằng `STATUS.PROCESSING`
- Thay thế hard-coded số 2 bằng `STATUS.COMPLETED`
- Cập nhật console logs để hiển thị đúng giá trị

### 3. Cập nhật Logic trong GiaCongPopup Component
**File**: `src/app/components/ds-bangve/gia-cong-popup/gia-cong-popup.component.ts`
- Giữ nguyên `trang_thai: 1` cho user_bangve records
- Thêm comment để rõ ràng: `// 1 = đang xử lý (STATUS.PROCESSING)`

## Quy chuẩn Trang_thai mới

### Cho BangVe (Bảng vẽ):
- `0` (NEW): Bảng vẽ mới, chưa được gán
- `1` (PROCESSING): Đang xử lý, đã được gán cho user
- `2` (COMPLETED): Đã hoàn thành

### Cho UserBangVe (Gán bảng vẽ cho user):
- `1` (PROCESSING): Đang xử lý
- `2` (COMPLETED): Đã hoàn thành

## Cách test

### Bước 1: Restart Development Server
1. Dừng Angular development server (Ctrl+C)
2. Chạy lại `ng serve` hoặc `npm start`
3. Clear browser cache (Hard reload)

### Bước 2: Test chức năng gán bảng vẽ
1. **Đăng nhập** với `totruongquanday@thibidi.com` / `Ab!123456`
2. **Truy cập** "Quản lý bảng vẽ"
3. **Chọn** một bảng vẽ có `trang_thai = 0` (mới)
4. **Click** "Thao tác quấn dây"
5. **Chọn** người gia công cho bối dây hạ và bối dây cao
6. **Click** "Xác nhận"

### Bước 3: Kiểm tra Console Logs
Trong Console, bạn sẽ thấy:
```
Processing confirmed result...
🔄 [updateDrawingStatusToInProgressInBackend] Updating drawing [id] to trang_thai = 1
✅ [updateDrawingStatusToInProgressInBackend] Successfully updated drawing [id] in Firebase
✅ Bangve status updated to in-progress successfully
🔄 [updateDrawingStatusToInProgress] Updating drawing [id] to trang_thai = 1 in frontend
```

### Bước 4: Kiểm tra Firebase Console
1. Truy cập Firebase Console
2. Vào Firestore Database
3. Tìm collection `bangve`
4. Tìm document của bảng vẽ vừa gán
5. Kiểm tra field `trang_thai` đã được cập nhật thành `1` (không phải 3)

### Bước 5: Kiểm tra Collection user_bangve
1. Trong Firebase Console, tìm collection `user_bangve`
2. Kiểm tra có 2 documents mới được tạo:
   - Document 1: `khau_sx = 'bd_ha'`, `trang_thai = 1`
   - Document 2: `khau_sx = 'bd_cao'`, `trang_thai = 1`

### Bước 6: Kiểm tra UI
1. **Tab "Mới"**: Bảng vẽ đã được gán sẽ biến mất
2. **Tab "Đang gia công"**: Bảng vẽ xuất hiện với `trang_thai = 1`
3. **Thông báo**: "Bảng vẽ đã được chuyển sang trạng thái đang xử lý!"

## Kết quả mong đợi
- ✅ `trang_thai` trong Firebase được cập nhật thành `1` (không phải 3)
- ✅ Bảng vẽ được chuyển từ tab "Mới" sang tab "Đang gia công"
- ✅ UI được cập nhật ngay lập tức
- ✅ Thông báo thành công hiển thị
- ✅ Dữ liệu user_bangve được lưu thành công với `trang_thai = 1`
- ✅ Constants được cập nhật đúng theo yêu cầu nghiệp vụ

## Files đã thay đổi
1. `src/app/models/common.enum.ts` - Cập nhật STATUS constants
2. `src/app/components/ds-bangve/ds-bangve.component.ts` - Thay thế hard-coded numbers
3. `src/app/components/ds-bangve/gia-cong-popup/gia-cong-popup.component.ts` - Cập nhật comments

## Lưu ý quan trọng
- Constants mới phù hợp với yêu cầu nghiệp vụ
- Logic đã được cập nhật để sử dụng constants thay vì hard-coded numbers
- Không cần thay đổi gì trong Firebase Console
- Tất cả logic xử lý trạng thái đã được đồng bộ
