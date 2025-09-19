# Cập nhật trạng thái Bangve sau khi gán User

## Vấn đề đã sửa
- Sau khi gán user bối dây hạ và bối dây cao, cần cập nhật trạng thái bangve từ 0 (mới) thành 1 (đang xử lý)
- Logic cũ có sự trùng lặp và phức tạp, gây ra xung đột
- Cần đơn giản hóa và đảm bảo trạng thái được cập nhật đúng

## Giải pháp đã áp dụng

### 1. Sửa logic trong Popup Close Handler
**File**: `src/app/components/ds-bangve/ds-bangve.component.ts`
- Loại bỏ logic trùng lặp
- Chỉ cập nhật trạng thái bangve một lần sau khi gán user thành công
- Sử dụng callback để đảm bảo thứ tự thực hiện đúng

### 2. Logic mới
```typescript
if (result && result.confirmed) {
  // Cập nhật trạng thái bảng vẽ thành 1 (đang xử lý) trong Firebase
  this.updateDrawingStatusToInProgressInBackend(drawing.id, () => {
    // Cập nhật frontend
    this.updateDrawingStatusToInProgress(drawing.id);
    
    // Reload data để cập nhật UI
    this.loadDrawings();
    
    // Hiển thị thông báo thành công
    this.thongbao('Bảng vẽ đã được chuyển sang trạng thái đang xử lý!', 'Đóng', 'success');
  });
}
```

### 3. Quy trình hoạt động
1. **User chọn** người gia công bối dây hạ và bối dây cao
2. **Popup lưu** dữ liệu vào collection `user_bangve` trong Firebase
3. **Popup đóng** và trả về `result.confirmed = true`
4. **Component cha** nhận kết quả và cập nhật trạng thái bangve
5. **Firebase** cập nhật `trang_thai = 1` trong collection `bangve`
6. **Frontend** cập nhật UI và hiển thị thông báo thành công

## Cách test

### Bước 1: Restart Development Server
1. Dừng Angular development server (Ctrl+C)
2. Chạy lại `ng serve` hoặc `npm start`
3. Clear browser cache (Hard reload)

### Bước 2: Test chức năng gán user và cập nhật trạng thái
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
5. Kiểm tra field `trang_thai` đã được cập nhật thành `1`

### Bước 5: Kiểm tra UI
1. **Tab "Mới"**: Bảng vẽ đã được gán sẽ biến mất
2. **Tab "Đang gia công"**: Bảng vẽ xuất hiện với `trang_thai = 1`
3. **Thông báo**: "Bảng vẽ đã được chuyển sang trạng thái đang xử lý!"

### Bước 6: Kiểm tra Collection user_bangve
1. Trong Firebase Console, tìm collection `user_bangve`
2. Kiểm tra có 2 documents mới được tạo:
   - Document 1: `khau_sx = 'bd_ha'`, `trang_thai = 1`
   - Document 2: `khau_sx = 'bd_cao'`, `trang_thai = 1`

## Kết quả mong đợi
- ✅ Bảng vẽ được chuyển từ tab "Mới" sang tab "Đang gia công"
- ✅ `trang_thai` trong Firebase được cập nhật thành `1`
- ✅ UI được cập nhật ngay lập tức
- ✅ Thông báo thành công hiển thị
- ✅ Dữ liệu user_bangve được lưu thành công
- ✅ Không còn lỗi Firebase document ID

## Files đã thay đổi
1. `src/app/components/ds-bangve/ds-bangve.component.ts` - Sửa logic popup close handler

## Lưu ý quan trọng
- Logic đã được đơn giản hóa và loại bỏ trùng lặp
- Trạng thái bangve được cập nhật sau khi gán user thành công
- UI được refresh để hiển thị thay đổi ngay lập tức
- Không cần thay đổi gì trong Firebase Console
