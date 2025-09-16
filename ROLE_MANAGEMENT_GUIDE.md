# Hướng Dẫn Quản Lý Phân Quyền

## Tổng Quan
Hệ thống quản lý phân quyền đã được thêm vào ứng dụng với các tính năng sau:

### 1. Quản Lý Phân Quyền
- **Vị trí**: Menu sidebar > "Quản Lý Phân Quyền"
- **Quyền truy cập**: Chỉ dành cho ADMIN
- **Chức năng**:
  - Xem danh sách các vai trò trong hệ thống
  - Xem chi tiết quyền hạn của từng vai trò
  - Xem số lượng người dùng thuộc mỗi vai trò
  - Chỉnh sửa vai trò (đang phát triển)
  - Xóa vai trò (đang phát triển)

### 2. Chức Năng Logout
- **Vị trí**: Cuối menu sidebar
- **Chức năng**: Đăng xuất khỏi hệ thống
- **Xác nhận**: Có dialog xác nhận trước khi đăng xuất

## Các Vai Trò Hiện Có

### 1. Quản trị viên (ADMIN)
- **Quyền**: Tất cả quyền trong hệ thống
- **Mô tả**: Có thể truy cập và quản lý mọi chức năng

### 2. Tổ trưởng quản dây (TOTRUONG_QUANDAY)
- **Quyền**: 
  - Tạo bảng vé
  - Sửa bảng vé
  - Xem bảng vé
  - Xóa bảng vé
- **Mô tả**: Quản lý tổ quản dây, tạo và quản lý bảng vé

### 3. Quản dây hàng (QUANDAY_HA)
- **Quyền**:
  - Tạo bảng đăng hàng
  - Sửa bảng đăng hàng
  - Xem bảng đăng hàng
- **Mô tả**: Quản lý bảng đăng hàng

### 4. Quản dây cao (QUANDAY_CAO)
- **Quyền**:
  - Tạo bảng đăng cao
  - Sửa bảng đăng cao
  - Xem bảng đăng cao
- **Mô tả**: Quản lý bảng đăng cao

### 5. Ép bồi dây (EP_BOIDAY)
- **Quyền**:
  - Tạo ép bồi dây
  - Sửa ép bồi dây
  - Xem ép bồi dây
- **Mô tả**: Quản lý ép bồi dây

### 6. Kiểm soát chất lượng (KCS)
- **Quyền**:
  - Phê duyệt KCS
  - Xem KCS
  - Kiểm soát chất lượng
- **Mô tả**: Kiểm soát và phê duyệt chất lượng sản phẩm

## Cách Sử Dụng

### Truy Cập Quản Lý Phân Quyền
1. Đăng nhập với tài khoản ADMIN
2. Click vào "Quản Lý Phân Quyền" trong menu sidebar
3. Xem danh sách các vai trò và quyền hạn

### Đăng Xuất
1. Click vào "Đăng Xuất" ở cuối menu sidebar
2. Xác nhận trong dialog
3. Hệ thống sẽ chuyển về trang đăng nhập

## Lưu Ý
- Chỉ tài khoản ADMIN mới có thể truy cập quản lý phân quyền
- Các chức năng chỉnh sửa và xóa vai trò đang được phát triển
- Hệ thống sẽ hiển thị thông báo "Chức năng đang được phát triển" khi click vào các nút này

## Cấu Trúc File
```
src/app/components/quan-ly-phan-quyen/
├── role-management.component.ts    # Component chính
├── role-management.component.html  # Template
└── role-management.component.scss  # Styles
```

## Cập Nhật Sidebar
- Thêm menu "Quản Lý Phân Quyền" với icon shield
- Thêm nút "Đăng Xuất" ở cuối sidebar với icon sign-out
- Cập nhật CSS cho nút logout với màu đỏ đặc trưng
