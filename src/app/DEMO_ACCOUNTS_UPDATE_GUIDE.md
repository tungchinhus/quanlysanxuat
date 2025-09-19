# Hướng dẫn cập nhật tài khoản demo đăng nhập

## Tổng quan
Đã cập nhật form đăng nhập để thêm các tài khoản demo với thông tin đăng nhập thực tế, giúp người dùng có thể đăng nhập nhanh chóng mà không cần nhập thủ công.

## Các tài khoản demo đã thêm

### 1. Tài khoản cũ (giữ nguyên)
- **Admin**: admin / admin123 (disabled)
- **Manager**: manager1 / manager123
- **User**: user1 / user123
- **Email**: user@example.com / user123

### 2. Tài khoản mới (theo yêu cầu)
- **Tổ trưởng**: totruongquanday@thibidi.com / Ab!123456
- **Quấn dây hạ**: quandayha1@thibidi.com / Ab!123456
- **Quấn dây cao**: quandaycao1@thibidi.com / Ab!123456
- **Ép bối dây**: epboiday1@thibidi.com / Ab!123456
- **KCS**: kcs1@thibidi.com / Ab!123456

## Các thay đổi đã thực hiện

### 1. Cập nhật TypeScript Component (`dang-nhap.component.ts`)

#### Thêm các tài khoản mới vào method `fillDemoAccount`:
```typescript
fillDemoAccount(accountType: 'admin' | 'manager' | 'user' | 'email' | 'totruong' | 'quandayha' | 'quandaycao' | 'epboiday' | 'kcs'): void {
  const accounts = {
    // Tài khoản cũ
    admin: { username: 'admin', password: 'admin123' },
    manager: { username: 'manager1', password: 'manager123' },
    user: { username: 'user1', password: 'user123' },
    email: { username: 'user@example.com', password: 'user123' },
    
    // Tài khoản mới
    totruong: { username: 'totruongquanday@thibidi.com', password: 'Ab!123456' },
    quandayha: { username: 'quandayha1@thibidi.com', password: 'Ab!123456' },
    quandaycao: { username: 'quandaycao1@thibidi.com', password: 'Ab!123456' },
    epboiday: { username: 'epboiday1@thibidi.com', password: 'Ab!123456' },
    kcs: { username: 'kcs1@thibidi.com', password: 'Ab!123456' }
  };
  
  const account = accounts[accountType];
  this.loginForm.patchValue(account);
}
```

### 2. Cập nhật HTML Template (`dang-nhap.component.html`)

#### Thêm các nút demo mới:
```html
<div class="demo-buttons">
  <!-- Tài khoản cũ -->
  <button mat-stroked-button [disabled]="true" (click)="fillDemoAccount('admin')" class="demo-button admin">
    <mat-icon>admin_panel_settings</mat-icon>
    Admin
  </button>
  
  <!-- Tài khoản mới -->
  <button mat-stroked-button (click)="fillDemoAccount('totruong')" class="demo-button totruong">
    <mat-icon>engineering</mat-icon>
    Tổ trưởng
  </button>
  
  <button mat-stroked-button (click)="fillDemoAccount('quandayha')" class="demo-button quandayha">
    <mat-icon>build</mat-icon>
    Quấn dây hạ
  </button>
  
  <button mat-stroked-button (click)="fillDemoAccount('quandaycao')" class="demo-button quandaycao">
    <mat-icon>build</mat-icon>
    Quấn dây cao
  </button>
  
  <button mat-stroked-button (click)="fillDemoAccount('epboiday')" class="demo-button epboiday">
    <mat-icon>precision_manufacturing</mat-icon>
    Ép bối dây
  </button>
  
  <button mat-stroked-button (click)="fillDemoAccount('kcs')" class="demo-button kcs">
    <mat-icon>verified</mat-icon>
    KCS
  </button>
</div>
```

#### Cập nhật danh sách thông tin đăng nhập:
```html
<div class="demo-credentials">
  <div class="credential-item">
    <strong>Tổ trưởng:</strong> totruongquanday@thibidi.com / Ab!123456
  </div>
  <div class="credential-item">
    <strong>Quấn dây hạ:</strong> quandayha1@thibidi.com / Ab!123456
  </div>
  <div class="credential-item">
    <strong>Quấn dây cao:</strong> quandaycao1@thibidi.com / Ab!123456
  </div>
  <div class="credential-item">
    <strong>Ép bối dây:</strong> epboiday1@thibidi.com / Ab!123456
  </div>
  <div class="credential-item">
    <strong>KCS:</strong> kcs1@thibidi.com / Ab!123456
  </div>
</div>
```

### 3. Cập nhật CSS Styling (`dang-nhap.component.css`)

#### Thêm màu sắc cho các nút demo mới:
```css
.demo-button.totruong {
  color: #6f42c1;
  border-color: #6f42c1;
}

.demo-button.quandayha {
  color: #fd7e14;
  border-color: #fd7e14;
}

.demo-button.quandaycao {
  color: #20c997;
  border-color: #20c997;
}

.demo-button.epboiday {
  color: #e83e8c;
  border-color: #e83e8c;
}

.demo-button.kcs {
  color: #dc3545;
  border-color: #dc3545;
}
```

#### Cập nhật animation delay:
```css
.demo-button:nth-child(1) { animation-delay: 0.1s; }
.demo-button:nth-child(2) { animation-delay: 0.2s; }
.demo-button:nth-child(3) { animation-delay: 0.3s; }
.demo-button:nth-child(4) { animation-delay: 0.4s; }
.demo-button:nth-child(5) { animation-delay: 0.5s; }
.demo-button:nth-child(6) { animation-delay: 0.6s; }
.demo-button:nth-child(7) { animation-delay: 0.7s; }
.demo-button:nth-child(8) { animation-delay: 0.8s; }
.demo-button:nth-child(9) { animation-delay: 0.9s; }
```

## Cách sử dụng

### 1. Đăng nhập nhanh
- Bấm vào bất kỳ nút demo nào để tự động điền thông tin đăng nhập
- Hệ thống sẽ tự động điền email và mật khẩu vào form
- Bấm "Đăng nhập" để thực hiện đăng nhập

### 2. Xem thông tin đăng nhập
- Thông tin đăng nhập được hiển thị trong phần "Tài khoản demo"
- Mỗi tài khoản có màu sắc riêng để dễ phân biệt
- Icon phù hợp với từng vai trò

## Lợi ích

### 1. Tiện lợi
- Không cần nhập thủ công email và mật khẩu
- Giảm thời gian đăng nhập
- Tránh lỗi nhập liệu

### 2. Trực quan
- Màu sắc khác nhau cho từng vai trò
- Icon phù hợp với chức năng
- Hiển thị thông tin đăng nhập rõ ràng

### 3. Bảo mật
- Mật khẩu được che khuất trong form
- Chỉ hiển thị khi cần thiết
- Dễ dàng thay đổi thông tin đăng nhập

## Lưu ý quan trọng

1. **Mật khẩu thực tế**: Các tài khoản demo sử dụng mật khẩu thực tế `Ab!123456`
2. **Email thực tế**: Tất cả email đều có domain `@thibidi.com`
3. **Vai trò rõ ràng**: Mỗi tài khoản đại diện cho một vai trò cụ thể trong hệ thống
4. **Dễ bảo trì**: Có thể dễ dàng thêm/sửa/xóa tài khoản demo

## Testing

### Test cases:
1. **Click nút demo**: Kiểm tra form được điền đúng thông tin
2. **Đăng nhập**: Kiểm tra đăng nhập thành công với tài khoản demo
3. **UI/UX**: Kiểm tra màu sắc, icon, và animation
4. **Responsive**: Kiểm tra hiển thị trên các kích thước màn hình khác nhau

### Kết quả mong đợi:
- Form được điền tự động khi click nút demo
- Đăng nhập thành công với tài khoản demo
- Giao diện đẹp và trực quan
- Hoạt động mượt mà trên mọi thiết bị
