# Hướng Dẫn Dropdown Menu Người Dùng

## Tổng Quan
Đã thêm dropdown menu người dùng ở góc phải màn hình (header) với giao diện giống như trong hình ảnh mẫu.

## Tính Năng

### 1. Avatar Người Dùng
- **Vị trí**: Góc phải màn hình, bên cạnh icon thông báo
- **Hiển thị**: Avatar tròn với chữ cái đầu của tên người dùng
- **Màu sắc**: Xanh dương (#1976d2) với chữ trắng
- **Kích thước**: 32px (desktop), 28px (mobile)

### 2. Dropdown Menu
Khi click vào avatar, sẽ hiển thị dropdown menu với:

#### Header Section
- **Avatar lớn**: 48px với chữ cái đầu tên
- **Tên người dùng**: Hiển thị tên đầy đủ hoặc email
- **Email**: Địa chỉ email của người dùng
- **Vai trò**: Hiển thị vai trò hiện tại (có thể click)

#### Menu Items
- **Thông tin cá nhân**: (Chưa implement)
- **Cài đặt**: (Chưa implement)  
- **Đăng xuất**: Chức năng logout hoàn chỉnh

### 3. Responsive Design
- **Desktop**: Avatar 32px, dropdown 280px width
- **Mobile**: Avatar 28px, dropdown 260px width
- **Text overflow**: Tự động cắt text dài với ellipsis

## Cách Hoạt Động

### 1. Hiển thị Avatar
- Tự động tạo chữ cái đầu từ `displayName` hoặc `email`
- Nếu có `displayName`: lấy chữ cái đầu và cuối
- Nếu chỉ có `email`: lấy 2 ký tự đầu của phần trước @

### 2. Dropdown Menu
- Click avatar để mở/đóng menu
- Click outside để đóng menu
- Menu có shadow và border radius đẹp mắt

### 3. Logout Function
- Click "Đăng xuất" để logout
- Tự động chuyển về trang login
- Xử lý lỗi nếu logout thất bại

## Cấu Trúc Code

### HTML Template
```html
<div class="user-menu" *ngIf="currentUser">
  <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-avatar-button">
    <div class="user-avatar">
      {{ getUserInitials(currentUser) }}
    </div>
  </button>
  
  <mat-menu #userMenu="matMenu" class="user-dropdown-menu">
    <!-- Menu content -->
  </mat-menu>
</div>
```

### TypeScript Methods
```typescript
getUserInitials(user: User): string {
  // Logic tạo chữ cái đầu
}

logout(): void {
  // Logic logout
}
```

### CSS Classes
- `.user-avatar-button`: Style cho button avatar
- `.user-avatar`: Style cho avatar nhỏ
- `.user-dropdown-menu`: Style cho dropdown
- `.user-menu-header`: Style cho header dropdown
- `.user-avatar-large`: Style cho avatar lớn trong dropdown

## Tích Hợp Với Hệ Thống

### 1. AuthService Integration
- Sử dụng `currentUser` observable từ AuthService
- Tự động ẩn/hiện menu khi login/logout
- Hiển thị thông tin người dùng real-time

### 2. Router Integration
- Logout redirect về `/login`
- Có thể thêm navigation cho các menu items khác

### 3. Material Design
- Sử dụng Angular Material Menu
- Consistent với design system
- Responsive và accessible

## Customization

### 1. Thay Đổi Màu Avatar
```scss
.user-avatar {
  background: #your-color;
}
```

### 2. Thêm Menu Items
```html
<button mat-menu-item (click)="yourFunction()">
  <mat-icon>your-icon</mat-icon>
  <span>Your Menu Item</span>
</button>
```

### 3. Thay Đổi Kích Thước
```scss
.user-avatar {
  width: 40px;
  height: 40px;
}
```

## Lưu Ý
- Dropdown chỉ hiển thị khi user đã đăng nhập
- Avatar tự động cập nhật khi thông tin user thay đổi
- Menu items "Thông tin cá nhân" và "Cài đặt" chưa được implement
- Có thể mở rộng thêm các chức năng khác trong tương lai
