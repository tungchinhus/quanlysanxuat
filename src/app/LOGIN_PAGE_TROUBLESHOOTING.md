# Hướng dẫn khắc phục sự cố trang đăng nhập

## Vấn đề: Không thể vào trang đăng nhập

### Các thay đổi đã thực hiện để sửa lỗi:

1. **Cập nhật default route** (`app.routes.ts`):
   ```typescript
   // Trước
   {
     path: '',
     redirectTo: '/dashboard',
     pathMatch: 'full'
   }
   
   // Sau
   {
     path: '',
     redirectTo: '/dang-nhap',
     pathMatch: 'full'
   }
   ```

2. **Thêm debug logging** (`dang-nhap.component.ts`):
   ```typescript
   ngOnInit(): void {
     if (this.authService.isAuthenticated()) {
       console.log('User is already authenticated, redirecting to dashboard');
       this.router.navigate(['/dashboard']);
     } else {
       console.log('User is not authenticated, showing login form');
     }
   }
   ```

## Cách kiểm tra và khắc phục:

### 1. Kiểm tra server có đang chạy không:
```bash
# Kiểm tra port 4200
netstat -an | findstr :4200

# Hoặc khởi động server
ng serve
```

### 2. Kiểm tra URL truy cập:
- **URL chính**: `http://localhost:4200/`
- **URL trực tiếp**: `http://localhost:4200/dang-nhap`

### 3. Kiểm tra Console Browser:
Mở Developer Tools (F12) và kiểm tra Console tab để xem:
- Có lỗi JavaScript nào không
- Thông báo debug từ component đăng nhập
- Lỗi network nếu có

### 4. Kiểm tra Network Tab:
- Xem có request nào bị fail không
- Kiểm tra status code của các request

### 5. Kiểm tra Authentication State:
```typescript
// Trong Console Browser
localStorage.getItem('currentUser')
localStorage.getItem('authToken')
```

## Các nguyên nhân có thể:

### 1. **Server không chạy**
- **Triệu chứng**: Không thể truy cập `http://localhost:4200`
- **Giải pháp**: Chạy `ng serve`

### 2. **Port bị chiếm dụng**
- **Triệu chứng**: Lỗi "Port 4200 is already in use"
- **Giải pháp**: 
  ```bash
  # Tìm process sử dụng port 4200
  netstat -ano | findstr :4200
  
  # Kill process (thay PID bằng process ID)
  taskkill /PID <PID> /F
  
  # Hoặc sử dụng port khác
  ng serve --port 4201
  ```

### 3. **Lỗi build/compile**
- **Triệu chứng**: Lỗi trong console khi build
- **Giải pháp**: 
  ```bash
  # Clean và rebuild
  ng build --configuration=development
  
  # Hoặc
  ng serve --configuration=development
  ```

### 4. **Lỗi routing**
- **Triệu chứng**: 404 hoặc blank page
- **Giải pháp**: Kiểm tra `app.routes.ts` và component imports

### 5. **Lỗi authentication logic**
- **Triệu chứng**: Redirect loop hoặc không hiển thị form
- **Giải pháp**: Kiểm tra `AuthService.isAuthenticated()` method

## Debug Steps:

### Step 1: Kiểm tra cơ bản
```bash
# 1. Khởi động server
ng serve

# 2. Mở browser và truy cập
http://localhost:4200
```

### Step 2: Kiểm tra Console
1. Mở Developer Tools (F12)
2. Vào Console tab
3. Tìm các thông báo:
   - "User is not authenticated, showing login form"
   - "User is already authenticated, redirecting to dashboard"
   - Các lỗi JavaScript

### Step 3: Kiểm tra Network
1. Vào Network tab
2. Refresh trang
3. Kiểm tra:
   - Status code 200 cho main page
   - Không có lỗi 404 cho resources
   - Các request API (nếu có)

### Step 4: Kiểm tra Local Storage
```javascript
// Trong Console Browser
console.log('Current User:', localStorage.getItem('currentUser'));
console.log('Auth Token:', localStorage.getItem('authToken'));
console.log('Is Authenticated:', /* check AuthService */);
```

## Các URL test:

1. **Trang chủ**: `http://localhost:4200/`
2. **Trang đăng nhập**: `http://localhost:4200/dang-nhap`
3. **Dashboard**: `http://localhost:4200/dashboard`

## Nếu vẫn không hoạt động:

### 1. Reset hoàn toàn:
```bash
# Xóa node_modules và reinstall
rm -rf node_modules
npm install

# Clean build
ng build --configuration=development
ng serve
```

### 2. Kiểm tra Angular CLI version:
```bash
ng version
```

### 3. Kiểm tra dependencies:
```bash
npm list @angular/core
npm list @angular/router
```

### 4. Tạo component test đơn giản:
```typescript
// Tạo component test để kiểm tra routing
@Component({
  selector: 'app-test',
  template: '<h1>Test Component Works!</h1>'
})
export class TestComponent {}
```

## Liên hệ hỗ trợ:

Nếu vẫn gặp vấn đề, hãy cung cấp:
1. Screenshot của Console errors
2. Screenshot của Network tab
3. Thông tin về browser và version
4. Log từ terminal khi chạy `ng serve`
