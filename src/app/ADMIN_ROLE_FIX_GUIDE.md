# Hướng dẫn sửa lỗi Role Admin cho chinhdvt@gmail.com

## Vấn đề
- User `chinhdvt@gmail.com` hiện tại có role "User" thay vì "admin"
- Không thể thấy menu "Quản lý người dùng" và "Quản lý phân quyền"
- Gặp lỗi 403 khi truy cập dashboard

## Giải pháp đã thực hiện

### 1. Cập nhật AuthGuard
- Loại bỏ permission `dashboard_view` khỏi route dashboard vì permission này chưa được định nghĩa
- Dashboard giờ chỉ yêu cầu role: `['admin', 'manager', 'user']`

### 2. Tạo Debug Component
- Thêm component debug tại `/debug-admin` để cập nhật role user
- Component có thể:
  - Xem thông tin user hiện tại
  - Cập nhật role của user bất kỳ thành admin
  - Tạo admin user mới

### 3. Cách sử dụng

#### Bước 1: Truy cập Debug Component
1. Mở trình duyệt và truy cập: `http://localhost:4200/debug-admin`
2. Đăng nhập với tài khoản hiện tại (chinhdvt@gmail.com)

#### Bước 2: Kiểm tra thông tin hiện tại
1. Xem phần "Current Status" để kiểm tra:
   - Users in system: Số lượng user
   - Current user: Tên user hiện tại
   - Current user email: Email user
   - Current user roles: Roles hiện tại
   - Is authenticated: Có đăng nhập không
   - Token valid: Token có hợp lệ không

#### Bước 3: Test Dashboard Access
1. Click nút "Test Dashboard Access" để kiểm tra quyền truy cập dashboard
2. Xem console log để debug chi tiết
3. Nếu vẫn lỗi 403, tiếp tục bước 4

#### Bước 3.5: Refresh User Data
1. Click nút "Refresh User Data" để cập nhật thông tin user
2. Kiểm tra console log để xem user data có được cập nhật không
3. Kiểm tra menu có hiển thị sau khi refresh không

#### Bước 4: Cập nhật Role (nếu cần)
1. Trong phần "Update User Role", nhập email: `chinhdvt@gmail.com`
2. Click nút "Update to Admin"
3. Kiểm tra thông báo thành công

#### Bước 5: Đăng nhập lại
1. Đăng xuất khỏi hệ thống
2. Đăng nhập lại với `chinhdvt@gmail.com`
3. Kiểm tra menu sidebar có hiển thị:
   - "Quản lý người dùng"
   - "Quản lý phân quyền"

#### Bước 6: Kiểm tra Dashboard
1. Click vào "Dashboard" trong menu
2. Kiểm tra không còn lỗi 403

## Code Changes

### 1. app.routes.ts
```typescript
{
  path: 'dashboard',
  loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
  canActivate: [AuthGuard],
  data: { roles: ['admin', 'manager', 'user'] } // Removed permissions
},
```

### 2. debug-admin.component.ts
- Thêm chức năng cập nhật role user
- Thêm form input để nhập email user
- Thêm method `updateUserToAdmin()`

## Kiểm tra kết quả

Sau khi thực hiện các bước trên:
1. ✅ User `chinhdvt@gmail.com` có role "admin"
2. ✅ Menu "Quản lý người dùng" hiển thị
3. ✅ Menu "Quản lý phân quyền" hiển thị  
4. ✅ Dashboard truy cập được bình thường
5. ✅ Không còn lỗi 403

## Lưu ý
- Debug component chỉ nên sử dụng trong môi trường development
- Trong production, nên xóa hoặc bảo vệ route `/debug-admin`
- Có thể tạo admin user trực tiếp trong Firebase Console nếu cần
