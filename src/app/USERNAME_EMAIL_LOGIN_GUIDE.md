# Hướng dẫn đăng nhập bằng Username hoặc Email

## Tổng quan
Hệ thống đã được cập nhật để hỗ trợ đăng nhập bằng cả **username** và **email**. Người dùng có thể sử dụng bất kỳ phương thức nào để truy cập vào hệ thống.

## Cách hoạt động

### 1. Xác thực Username
- Khi người dùng nhập username (ví dụ: `user1`)
- Hệ thống sẽ tìm kiếm trong database để tìm user có username tương ứng
- Lấy email của user đó để thực hiện xác thực Firebase
- Firebase Auth sẽ xác thực bằng email thực tế của user

### 2. Xác thực Email
- Khi người dùng nhập email (ví dụ: `user@example.com`)
- Hệ thống sẽ tìm kiếm user có email tương ứng
- Sử dụng email đó để xác thực trực tiếp với Firebase Auth

## Các thay đổi đã thực hiện

### 1. AuthService (`src/app/services/auth.service.ts`)
```typescript
async login(usernameOrEmail: string, password: string) {
  // Kiểm tra input là email hay username
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmail = emailRegex.test(usernameOrEmail);
  
  if (isEmail) {
    // Tìm user bằng email
    appUser = users.find(u => u.email?.toLowerCase() === usernameOrEmail.toLowerCase());
  } else {
    // Tìm user bằng username và lấy email
    appUser = users.find(u => u.username?.toLowerCase() === usernameOrEmail.toLowerCase());
    actualEmail = appUser.email;
  }
  
  // Sử dụng email thực để xác thực Firebase
  await signInWithEmailAndPassword(auth, actualEmail, password);
}
```

### 2. Login Component (`src/app/components/dang-nhap/`)
- **UI**: Cập nhật label thành "Tên đăng nhập hoặc Email"
- **Validation**: Thêm validator hỗ trợ cả username và email
- **Demo**: Thêm demo button cho email login

### 3. Form Validation
```typescript
private usernameOrEmailValidator(control: any) {
  const value = control.value.trim();
  
  // Kiểm tra email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(value)) return null;
  
  // Kiểm tra username format
  const usernameRegex = /^[a-zA-Z0-9._-]{3,}$/;
  if (usernameRegex.test(value)) return null;
  
  return { invalidFormat: true };
}
```

## Lưu ý quan trọng

### 1. Yêu cầu Database
- Mỗi user phải có cả `username` và `email` trong database
- Email phải là email thực tế đã được đăng ký với Firebase Auth

### 2. Xử lý lỗi
- Nếu username không tồn tại: "Tên đăng nhập không tồn tại"
- Nếu email không tồn tại: "Tài khoản không tồn tại"
- Nếu mật khẩu sai: "Tên đăng nhập hoặc mật khẩu không đúng"

### 3. Bảo mật
- Firebase Auth vẫn sử dụng email để xác thực
- Username chỉ được dùng để tìm email tương ứng
- Tất cả xác thực đều thông qua Firebase Auth

## Demo Accounts
- **Username**: `manager1` / `manager123`
- **Username**: `user1` / `user123`  
- **Email**: `user@example.com` / `user123`

## Troubleshooting

### Lỗi "auth/invalid-email"
- Đảm bảo user có email hợp lệ trong database
- Kiểm tra format email trong database

### Lỗi "Tên đăng nhập không tồn tại"
- Kiểm tra username có tồn tại trong database không
- Đảm bảo username không có khoảng trắng thừa

### Lỗi "Tài khoản không tồn tại"
- Kiểm tra email có tồn tại trong database không
- Đảm bảo email đã được đăng ký với Firebase Auth
