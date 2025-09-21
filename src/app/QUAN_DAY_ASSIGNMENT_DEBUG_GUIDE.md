# Hướng dẫn Debug Quan Day Assignment

## Vấn đề
Khi user quan dây đã được gán cho bảng vẽ thì sau khi login vào phải thấy được bảng vẽ đã được gán.

## Các bước đã thực hiện

### 1. Sửa lỗi mapping user_id trong gia-cong-popup component
- **File**: `src/app/components/ds-bangve/gia-cong-popup/gia-cong-popup.component.ts`
- **Vấn đề**: `userId` được set thành `undefined` trong Worker object
- **Giải pháp**: Set `userId` giống với `id` từ Firestore

### 2. Sửa lỗi mapping Firebase UID trong user_bangve
- **File**: `src/app/components/ds-bangve/gia-cong-popup/gia-cong-popup.component.ts`
- **Vấn đề**: Sử dụng `user_id` từ Firestore thay vì Firebase Authentication UID
- **Giải pháp**: Sử dụng `firebase_uid` với email của user để lookup

### 3. Tạo component debug
- **File**: `src/app/components/debug-quan-day-assignment/debug-quan-day-assignment.component.ts`
- **Route**: `/debug-quan-day-assignment`
- **Chức năng**: Hiển thị chi tiết quá trình load dữ liệu cho user quan dây

## Cách test và debug

### Bước 1: Tạo user quan dây
1. Đăng nhập với tài khoản admin
2. Vào trang "Quản lý người dùng"
3. Tạo user mới với:
   - Email: `quandayha@test.com` (cho bối dây hạ)
   - Email: `quandaycao@test.com` (cho bối dây cao)
   - Role: `quandayha` hoặc `quandaycao`
   - Khau_sx: `quandayha` hoặc `quandaycao`

### Bước 2: Gán bảng vẽ cho user quan dây
1. Vào trang "Danh sách bảng vẽ"
2. Chọn một bảng vẽ có trạng thái "Mới"
3. Click "Gia công"
4. Chọn user quan dây hạ và quan dây cao
5. Xác nhận

### Bước 3: Test với user quan dây
1. Đăng nhập với user quan dây vừa tạo
2. Kiểm tra xem có được redirect đến `/ds-quan-day` không
3. Kiểm tra xem có thấy bảng vẽ đã được gán không

### Bước 4: Debug chi tiết
1. Truy cập `/ui-debug` - Debug component kiểm tra vấn đề hiển thị giao diện (khuyến nghị)
2. Truy cập `/data-flow-debug` - Debug component kiểm tra từng bước tạo data
3. Truy cập `/assignment-debug` - Debug component chuyên về assignment mismatch
4. Truy cập `/step-by-step-debug` - Debug component chi tiết nhất
5. Truy cập `/simple-debug` - Debug component đơn giản
6. Truy cập `/test-quan-day-assignment` - Test component đơn giản
7. Truy cập `/debug-quan-day-assignment` - Debug component chi tiết
8. Kiểm tra các thông tin:
   - **Data Flow Check**: Kiểm tra từng bước tạo data
   - **Mapped Data Details**: Chi tiết mapped data
   - **Filtered Data Details**: Chi tiết filtered data
   - **New Tab Items**: Items trong tab "Mới"

## Các vấn đề có thể gặp

### 1. User không được redirect đúng
- **Nguyên nhân**: Logic redirect trong `dang-nhap.component.ts`
- **Kiểm tra**: Role của user có đúng không
- **Giải pháp**: Cập nhật logic redirect

### 2. User không thấy bảng vẽ
- **Nguyên nhân**: 
  - User_bangve records không được tạo đúng
  - Logic filter trong `ds-quan-day.component.ts` có vấn đề
  - Role detection không đúng
  - **Logic filter mới**: User chỉ thấy assignments đúng với role:
    - User `boidayha` chỉ thấy assignments có `khau_sx = 'bd_ha'` hoặc `bd_ha_id` có giá trị
    - User `boidaycao` chỉ thấy assignments có `khau_sx = 'bd_cao'` hoặc `bd_cao_id` có giá trị
    - User `epboiday` chỉ thấy assignments có `khau_sx = 'bd_ep'` hoặc `bd_ep_id` có giá trị
- **Kiểm tra**: Sử dụng debug component để xem chi tiết

### 3. User_bangve records không được tạo
- **Nguyên nhân**: Lỗi trong `gia-cong-popup.component.ts`
- **Kiểm tra**: Console logs khi gán bảng vẽ
- **Giải pháp**: Đã sửa lỗi mapping user_id

## Logs quan trọng

### Khi gán bảng vẽ:
```
=== addUserBangVeRecords called ===
boiDayHa: {...}
boiDayCao: {...}
Current user ID from Firestore: 123
userBangVeHa: {...}
userBangVeCao: {...}
UserBangVe records added successfully to Firebase: [...]
```

### Khi load dữ liệu cho user quan dây:
```
=== LOAD QUAN DAY DATA FROM FIREBASE START ===
Current user: {...}
User role: {...}
Is gia cong ha: true/false
Is gia cong cao: true/false
User assignments loaded: X items
Filtered assignments for boidayha: X items
Assigned bangve loaded: X items
Filtered results:
- New tab (quanDays): X items
- In-progress tab: X items
```

## Kết quả mong đợi

Sau khi thực hiện các bước trên:
1. User quan dây đăng nhập sẽ được redirect đến `/ds-quan-day`
2. User sẽ thấy bảng vẽ đã được gán trong tab "Mới"
3. Khi bắt đầu gia công, bảng vẽ sẽ chuyển sang tab "Đang gia công"
4. Khi hoàn thành, bảng vẽ sẽ chuyển sang tab "Đã hoàn thành"

## Troubleshooting

Nếu vẫn có vấn đề:
1. Kiểm tra console logs
2. Sử dụng debug component
3. Kiểm tra dữ liệu trong Firebase Firestore
4. Kiểm tra role và permissions của user
