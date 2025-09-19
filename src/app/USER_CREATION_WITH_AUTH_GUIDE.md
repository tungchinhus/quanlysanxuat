# Hướng dẫn tạo User mới với Authentication

## Tổng quan
Quy trình tạo user mới đã được cập nhật để đảm bảo:
1. **Authentication trước**: Tạo user trong Firebase Authentication
2. **Lưu Firestore sau**: Lưu thông tin user vào Firestore với documentID là Firebase UID
3. **Trường UID**: Thêm trường `uid` trong user data để lưu Firebase Authentication UID

## Các method mới được thêm

### 1. AuthService.createUserWithAuth()
```typescript
async createUserWithAuth(
  userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, 
  password: string
): Promise<{ success: boolean; message: string; user?: User; firebaseUID?: string }>
```

**Quy trình:**
1. Tạo user trong Firebase Authentication với email và password
2. Lấy Firebase UID từ Authentication
3. Tạo user data với Firebase UID làm ID
4. Lưu user data vào Firestore với documentID là Firebase UID
5. Nếu lưu Firestore thất bại, xóa user khỏi Authentication (rollback)

### 2. FirebaseUserManagementService.createUserWithDocumentId()
```typescript
async createUserWithDocumentId(
  userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, 
  documentId: string
): Promise<User>
```

**Chức năng:**
- Tạo user trong Firestore với document ID cụ thể
- Sử dụng `setDoc()` thay vì `addDoc()` để kiểm soát document ID

### 3. UserManagementFirebaseService.createUserWithDocumentId()
```typescript
createUserWithDocumentId(
  userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, 
  documentId: string
): Observable<User>
```

**Chức năng:**
- Wrapper Observable cho FirebaseUserManagementService.createUserWithDocumentId()

### 4. UserBangVeService.createUserWithAuth()
```typescript
createUserWithAuth(
  userData: any, 
  password: string
): Observable<{ success: boolean; message: string; user?: any; firebaseUID?: string }>
```

**Chức năng:**
- Wrapper Observable cho AuthService.createUserWithAuth()

## Cách sử dụng

### Ví dụ 1: Tạo user mới từ component
```typescript
import { UserBangVeService } from './services/user-bangve.service';
import { User } from './models/user.model';

constructor(private userBangVeService: UserBangVeService) {}

async createNewUser() {
  const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
    username: 'newuser',
    email: 'newuser@example.com',
    fullName: 'New User',
    phone: '0123456789',
    department: 'IT',
    position: 'Developer',
    isActive: true,
    roles: ['user'],
    uid: '' // Sẽ được set tự động thành Firebase UID
  };

  const password = 'SecurePassword123!';

  this.userBangVeService.createUserWithAuth(userData, password).subscribe({
    next: (result) => {
      if (result.success) {
        console.log('User created successfully:', result.user);
        console.log('Firebase UID:', result.firebaseUID);
        // User đã được tạo trong Authentication và lưu vào Firestore
      } else {
        console.error('Failed to create user:', result.message);
      }
    },
    error: (error) => {
      console.error('Error creating user:', error);
    }
  });
}
```

### Ví dụ 2: Tạo user trực tiếp từ AuthService
```typescript
import { AuthService } from './services/auth.service';

constructor(private authService: AuthService) {}

async createUserDirectly() {
  const userData = {
    username: 'admin',
    email: 'admin@example.com',
    fullName: 'Administrator',
    isActive: true,
    roles: ['admin']
  };

  const password = 'AdminPassword123!';

  try {
    const result = await this.authService.createUserWithAuth(userData, password);
    
    if (result.success) {
      console.log('User created:', result.user);
      console.log('Firebase UID:', result.firebaseUID);
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Exception:', error);
  }
}
```

## Xử lý lỗi

### Các lỗi Authentication phổ biến:
- `auth/email-already-in-use`: Email đã được sử dụng
- `auth/invalid-email`: Email không hợp lệ
- `auth/weak-password`: Mật khẩu quá yếu
- `auth/operation-not-allowed`: Tạo tài khoản không được phép

### Rollback mechanism:
- Nếu lưu Firestore thất bại, user sẽ được xóa khỏi Firebase Authentication
- Đảm bảo tính nhất quán dữ liệu

## Cấu trúc User Model

```typescript
export interface User {
  id: string;                    // Document ID trong Firestore (Firebase UID)
  uid?: string;                  // Firebase Authentication UID - để trống sẽ thêm sau
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  department?: string;
  position?: string;
  isActive: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  createdBy?: string;
  updatedBy?: string;
}
```

## Lợi ích của quy trình mới

1. **Tính nhất quán**: Firebase UID được sử dụng làm document ID trong Firestore
2. **Trường UID**: Lưu Firebase UID trong trường `uid` để dễ dàng tham chiếu
3. **Bảo mật**: User phải được tạo trong Authentication trước
4. **Rollback**: Tự động xóa user khỏi Authentication nếu lưu Firestore thất bại
5. **Dễ sử dụng**: API đơn giản với error handling tốt
6. **Tương thích**: Hoạt động với hệ thống hiện tại

## Lưu ý quan trọng

1. **Password requirements**: Mật khẩu phải đáp ứng yêu cầu của Firebase Authentication
2. **Email validation**: Email phải hợp lệ và chưa được sử dụng
3. **Roles**: Đảm bảo roles được định nghĩa đúng trong hệ thống
4. **Error handling**: Luôn xử lý các trường hợp lỗi có thể xảy ra
5. **Testing**: Test kỹ quy trình tạo user trước khi deploy production
