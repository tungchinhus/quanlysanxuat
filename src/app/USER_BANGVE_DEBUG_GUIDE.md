# Hướng dẫn Debug User BangVe Assignment

## Vấn đề
User đã login nhưng không thấy bảng vẽ được gán cho mình trong trang ds-quan-day.

## Các bước Debug

### 1. Kiểm tra dữ liệu User BangVe
Truy cập: `http://localhost:4200/debug-user-bangve`

Component này sẽ hiển thị:
- Thông tin user hiện tại (email, UID, Firestore ID)
- Tất cả records trong collection `user_bangve`
- Assignments của user hiện tại

### 2. Tạo Assignment Test
Truy cập: `http://localhost:4200/test-assignment`

Component này cho phép:
- Tạo assignment mới cho user và bảng vẽ
- Kiểm tra tất cả assignments hiện có
- Test flow hoàn chỉnh từ tạo assignment đến hiển thị

### 3. Kiểm tra Logic Hiển thị

#### Trong ds-quan-day.component.ts:

1. **Kiểm tra user role detection:**
```typescript
console.log('User role flags:', {
  isGiaCongHa: this.isGiaCongHa,
  isGiaCongCao: this.isGiaCongCao,
  isGiaCongEp: this.isGiaCongEp
});
```

2. **Kiểm tra user assignments:**
```typescript
console.log('User assignments by user_id:', userAssignmentsByUserId.length, 'items');
console.log('User assignments by firebase_uid:', userAssignmentsByFirebaseUID.length, 'items');
console.log('Combined user assignments:', userAssignments.length, 'items');
```

3. **Kiểm tra filtered assignments:**
```typescript
console.log('Filtered assignments for boidayha:', relevantAssignments.length, 'items');
console.log('Sample assignments:', relevantAssignments.slice(0, 2));
```

4. **Kiểm tra mapped data:**
```typescript
console.log('Mapped data length:', mappedData.length);
console.log('Sample mapped data:', mappedData.slice(0, 2));
```

### 4. Các Vấn đề Thường Gặp

#### A. User không có role phù hợp
- Kiểm tra `isGiaCongHa`, `isGiaCongCao`, `isGiaCongEp`
- Đảm bảo user có role `quandayha`, `quandaycao`, `quandayep` trong Firestore

#### B. Không có assignments
- Kiểm tra collection `user_bangve` có dữ liệu không
- Kiểm tra `user_id` và `firebase_uid` mapping
- Đảm bảo assignment có `bd_ha_id`, `bd_cao_id`, hoặc `bd_ep_id` phù hợp

#### C. Assignment không match với role
- Kiểm tra `khau_sx` field trong assignment
- Kiểm tra `bd_ha_id`, `bd_cao_id`, `bd_ep_id` fields

#### D. BangVe không tồn tại
- Kiểm tra `bangve_id` trong assignment có match với `id` trong collection `bangve`
- Đảm bảo `bangve_id` là string

### 5. Cách Sửa Lỗi

#### Nếu không có assignments:
1. Sử dụng component test-assignment để tạo assignment mới
2. Kiểm tra logic tạo assignment trong gia-cong-popup.component.ts

#### Nếu có assignments nhưng không hiển thị:
1. Kiểm tra role detection logic
2. Kiểm tra filtering logic trong `loadQuanDayData()`
3. Kiểm tra data mapping từ Firebase sang QuanDayData

#### Nếu có lỗi mapping:
1. Kiểm tra `bangve_id` type (phải là string)
2. Kiểm tra `user_id` type (phải là number)
3. Kiểm tra Firebase UID mapping

### 6. Console Logs Quan Trọng

Khi debug, chú ý các log sau:
- `=== LOAD QUAN DAY DATA FROM FIREBASE START ===`
- `User assignments by user_id: X items`
- `User assignments by firebase_uid: Y items`
- `Filtered assignments for boidayha: Z items`
- `Mapped data length: N`
- `Final data counts:`

### 7. Test Cases

1. **Tạo assignment mới:**
   - Chọn user có role `quandayha`
   - Chọn bảng vẽ có sẵn
   - Tạo assignment với `khau_sx = 'bd_ha'`

2. **Kiểm tra hiển thị:**
   - Login với user vừa tạo assignment
   - Vào trang ds-quan-day
   - Kiểm tra tab "Mới" có hiển thị bảng vẽ không

3. **Test các trạng thái:**
   - Assignment mới: `trang_thai = 0`
   - Đang gia công: `trang_thai = 1`
   - Hoàn thành: `trang_thai = 2`

## Kết Luận

Vấn đề chính thường là:
1. User không có role phù hợp
2. Không có assignments trong database
3. Lỗi mapping giữa user_id và firebase_uid
4. Lỗi filtering logic theo role

Sử dụng các debug components để xác định chính xác vấn đề và sửa chữa tương ứng.
