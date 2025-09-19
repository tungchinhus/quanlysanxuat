# Hướng dẫn cập nhật chức năng "Gia công bảng vẽ"

## Tổng quan
Đã cập nhật chức năng "Gia công bảng vẽ" để khi bấm "Xác nhận" sẽ:
1. Cập nhật cột `trang_thai` của bảng vẽ thành 1 (đang xử lý)
2. Thêm 2 dòng dữ liệu mới vào bảng `user_bangve`
3. Chuyển bảng vẽ từ tab "Bảng vẽ mới" sang tab "Đang gia công"

## Các thay đổi đã thực hiện

### 1. Tạo UserBangVeService (`src/app/services/user-bangve.service.ts`)
- Service mới để xử lý các thao tác với bảng `user_bangve`
- Các method chính:
  - `addUserBangVe()`: Thêm một bản ghi user_bangve
  - `addMultipleUserBangVe()`: Thêm nhiều bản ghi user_bangve
  - `getUserBangVeByUserId()`: Lấy danh sách theo user_id
  - `getUserBangVeByBangVeId()`: Lấy danh sách theo bangve_id
  - `updateUserBangVeStatus()`: Cập nhật trạng thái
  - `deleteUserBangVe()`: Xóa bản ghi

### 2. Cập nhật GiaCongPopupComponent (`src/app/components/ds-bangve/gia-cong-popup/`)
- Import `UserBangVeService` và `UserBangVeData`
- Thêm method `addUserBangVeRecords()` để thêm dữ liệu vào bảng user_bangve
- Cập nhật method `onConfirm()` để gọi API thêm dữ liệu

#### Cấu trúc dữ liệu UserBangVeData:
```typescript
interface UserBangVeData {
  id?: number;
  bangve_id: number;
  user_id: number;
  khau_sx: string; // 'bd_ha' hoặc 'bd_cao'
  trang_thai: number; // 1 = đang xử lý, 2 = đã hoàn thành
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
  status?: boolean; // true = active, false = inactive
}
```

### 3. Cập nhật DsBangveComponent (`src/app/components/ds-bangve/ds-bangve.component.ts`)
- Cập nhật method `onGiaCong()` để xử lý kết quả từ popup
- Thêm logic cập nhật trạng thái bảng vẽ thành 1 (đang xử lý)
- Cập nhật method `updateDrawingStatusToInProgress()` để cập nhật cả frontend và backend

## Luồng hoạt động

### Khi bấm "Xác nhận" trong popup:

1. **Validation**: Kiểm tra form có hợp lệ và đã chọn đủ 2 user khác nhau
2. **Tạo dữ liệu UserBangVe**: 
   - Dòng 1: User bối dây hạ với `khau_sx = 'bd_ha'` và `trang_thai = 1`
   - Dòng 2: User bối dây cao với `khau_sx = 'bd_cao'` và `trang_thai = 1`
3. **Gọi API**: Sử dụng `UserBangVeService.addMultipleUserBangVe()` để thêm 2 dòng dữ liệu
4. **Cập nhật trạng thái bảng vẽ**: 
   - Frontend: Cập nhật `trang_thai = 1` và chuyển sang tab "Đang gia công"
   - Backend: Gọi Firebase để cập nhật trạng thái
5. **Hiển thị thông báo**: Thông báo thành công cho người dùng

## API Endpoints

### UserBangVe API
- **Base URL**: `https://localhost:7190/api/UserBangVe`
- **POST** `/`: Thêm một bản ghi user_bangve
- **POST** `/multiple`: Thêm nhiều bản ghi user_bangve
- **GET** `/user/{userId}`: Lấy danh sách theo user_id
- **GET** `/bangve/{bangveId}`: Lấy danh sách theo bangve_id
- **PUT** `/{id}/status`: Cập nhật trạng thái
- **DELETE** `/{id}`: Xóa bản ghi

## Cấu trúc dữ liệu

### Bảng user_bangve
```sql
CREATE TABLE user_bangve (
  id INT PRIMARY KEY AUTO_INCREMENT,
  bangve_id INT NOT NULL,
  user_id INT NOT NULL,
  khau_sx VARCHAR(50) NOT NULL, -- 'bd_ha' hoặc 'bd_cao'
  trang_thai INT NOT NULL, -- 1 = đang xử lý, 2 = đã hoàn thành
  created_at DATETIME,
  updated_at DATETIME,
  created_by INT,
  updated_by INT,
  status BOOLEAN DEFAULT TRUE
);
```

### Bảng bangve
```sql
-- Cột trang_thai được cập nhật:
-- NULL = mới tạo
-- 1 = đang xử lý
-- 2 = đã hoàn thành
```

## Xử lý lỗi

### Lỗi thường gặp:
1. **"No authentication token available"**: User chưa đăng nhập
2. **"No drawing data available"**: Không có dữ liệu bảng vẽ
3. **API errors**: Lỗi từ server khi gọi API

### Xử lý lỗi:
- Hiển thị thông báo lỗi phù hợp cho người dùng
- Log chi tiết lỗi để debug
- Không đóng popup khi có lỗi

## Testing

### Test cases:
1. **Happy path**: Chọn 2 user khác nhau và bấm "Xác nhận"
2. **Validation**: Chọn cùng 1 user cho cả 2 khâu
3. **Empty selection**: Không chọn user nào
4. **API error**: Simulate lỗi API
5. **No drawing data**: Không có dữ liệu bảng vẽ

### Kiểm tra kết quả:
1. Bảng vẽ chuyển sang tab "Đang gia công"
2. Cột `trang_thai` = 1
3. Bảng `user_bangve` có 2 dòng mới
4. Thông báo thành công hiển thị

## Lưu ý quan trọng

1. **Authentication**: Cần token hợp lệ để gọi API
2. **Data validation**: Kiểm tra dữ liệu trước khi gọi API
3. **Error handling**: Xử lý lỗi một cách graceful
4. **UI feedback**: Cung cấp feedback rõ ràng cho người dùng
5. **Database consistency**: Đảm bảo dữ liệu nhất quán giữa các bảng
