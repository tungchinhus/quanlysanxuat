# Hướng dẫn khắc phục vấn đề mất role khi reload trang

## Vấn đề đã được khắc phục

Vấn đề mất role của user khi reload trang đã được khắc phục thông qua các cải tiến sau:

### 1. Cải thiện AuthService

**File:** `src/app/services/auth.service.ts`

#### Thay đổi chính:
- **Tách riêng method `loadStoredAuthData()`**: Load dữ liệu từ localStorage ngay lập tức khi khởi tạo
- **Thêm method `isTokenValidFromString()`**: Validate token trước khi sử dụng
- **Cải thiện method `ensureAuthStateLoaded()`**: Đảm bảo auth state được load đúng cách
- **Cải thiện method `isAuthenticated()`**: Validate token trước khi xác nhận authentication

#### Cách hoạt động:
```typescript
private initializeAuth(): void {
  // Load từ localStorage ngay lập tức
  this.loadStoredAuthData();
  
  // Sau đó subscribe Firebase auth state
  onAuthStateChanged(this.firebaseService.getAuth(), async (fbUser) => {
    // Xử lý auth state change...
  });
}
```

### 2. Cải thiện AuthGuard

**File:** `src/app/guards/auth.guard.ts`

#### Thay đổi chính:
- **Retry mechanism**: Thử lại nhiều lần với interval ngắn hơn (500ms)
- **Max attempts**: Tối đa 5 lần thử
- **Better error handling**: Xử lý lỗi tốt hơn

#### Cách hoạt động:
```typescript
private checkRoles(roles: string[]): Observable<boolean> {
  if (!currentUser) {
    // Retry với 5 attempts, mỗi 500ms
    return new Observable(observer => {
      let attempts = 0;
      const maxAttempts = 5;
      const checkInterval = 500;
      
      const checkAuth = () => {
        attempts++;
        const retryUser = this.authService.getCurrentUser();
        
        if (retryUser) {
          // Success - proceed with role check
        } else if (attempts < maxAttempts) {
          // Retry
          setTimeout(checkAuth, checkInterval);
        } else {
          // Max attempts reached - redirect to login
        }
      };
    });
  }
}
```

### 3. Component Debug

**File:** `src/app/components/auth-debug/auth-debug.component.ts`

#### Tính năng:
- Hiển thị trạng thái authentication real-time
- Kiểm tra localStorage data
- Test các method authentication
- Debug messages với timestamp

#### Cách sử dụng:
1. Trong `src/app/app.ts`, set `showDebugInfo = true`
2. Reload trang và quan sát debug info
3. Test các button để kiểm tra functionality

## Cách test giải pháp

### 1. Test cơ bản
```bash
# 1. Đăng nhập với user có role admin
# 2. Reload trang (F5 hoặc Ctrl+R)
# 3. Kiểm tra xem role có được giữ lại không
```

### 2. Test với Debug Component
```typescript
// Trong src/app/app.ts
showDebugInfo = true; // Enable debug component
```

Sau đó:
1. Đăng nhập
2. Reload trang
3. Quan sát debug info
4. Click "Test Ensure Auth State" để test method mới

### 3. Test các scenario khác nhau

#### Scenario 1: User có role trong database
- Đăng nhập với user có trong Firestore
- Reload trang
- Kiểm tra role được load từ database

#### Scenario 2: Demo user (không có trong database)
- Đăng nhập với email chứa keyword (admin, totruong, etc.)
- Reload trang
- Kiểm tra role được assign dựa trên email

#### Scenario 3: Token expired
- Đăng nhập và chờ token hết hạn
- Reload trang
- Kiểm tra user bị logout tự động

## Các cải tiến đã thực hiện

### 1. Immediate localStorage Loading
- Load auth data từ localStorage ngay khi service khởi tạo
- Không chờ Firebase auth state change

### 2. Token Validation
- Validate token trước khi sử dụng
- Clear auth data nếu token invalid

### 3. Retry Mechanism
- AuthGuard retry nhiều lần với interval ngắn
- Đảm bảo auth state được load đúng cách

### 4. Better Error Handling
- Xử lý lỗi tốt hơn trong các method
- Log chi tiết để debug

### 5. Debug Tools
- Component debug để monitor auth state
- Real-time updates khi auth state thay đổi

## Troubleshooting

### Vấn đề: Vẫn mất role sau reload
**Giải pháp:**
1. Kiểm tra localStorage có data không
2. Kiểm tra token có valid không
3. Sử dụng debug component để monitor
4. Check console logs

### Vấn đề: AuthGuard redirect về login
**Giải pháp:**
1. Kiểm tra retry mechanism
2. Tăng maxAttempts nếu cần
3. Kiểm tra network connection

### Vấn đề: Role không đúng
**Giải pháp:**
1. Kiểm tra user data trong Firestore
2. Kiểm tra email mapping logic
3. Kiểm tra role assignment logic

## Monitoring và Debug

### Console Logs
```typescript
// Các log quan trọng để monitor:
console.log('Auth data loaded from localStorage:', user);
console.log('Retry attempt X successful, user found:', user);
console.log('Max retry attempts reached, redirecting to login');
```

### Debug Component
- Real-time auth state monitoring
- localStorage inspection
- Method testing
- Debug message history

## Kết luận

Giải pháp đã khắc phục vấn đề mất role khi reload trang thông qua:

1. **Immediate loading** từ localStorage
2. **Token validation** trước khi sử dụng
3. **Retry mechanism** trong AuthGuard
4. **Better error handling** và logging
5. **Debug tools** để monitor và troubleshoot

Vấn đề này không còn xảy ra và user role sẽ được giữ lại sau khi reload trang.
