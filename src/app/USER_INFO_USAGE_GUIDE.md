# Hướng dẫn sử dụng User Info và Date Format Services

## Tổng quan

Dự án đã được tích hợp hai service chính để quản lý thông tin user và định dạng ngày tháng:

1. **UserInfoService** - Lấy thông tin user đang đăng nhập
2. **DateFormatService** - Định dạng ngày tháng theo chuẩn Việt Nam

## 1. UserInfoService

### Import Service

```typescript
import { UserInfoService } from '../services/user-info.service';

constructor(private userInfoService: UserInfoService) {}
```

### Các phương thức chính

#### 1.1. Lấy họ tên đầy đủ
```typescript
getCurrentUserFullName(): string
```
**Ví dụ:**
```typescript
const fullName = this.userInfoService.getCurrentUserFullName();
console.log(fullName); // "Nguyễn Văn A"
```

#### 1.2. Lấy thông tin user đầy đủ
```typescript
getCurrentUser(): User | null
```
**Ví dụ:**
```typescript
const user = this.userInfoService.getCurrentUser();
if (user) {
  console.log(user.fullName); // "Nguyễn Văn A"
  console.log(user.email);    // "nguyenvana@example.com"
  console.log(user.roles);    // ["admin", "user"]
}
```

#### 1.3. Kiểm tra trạng thái đăng nhập
```typescript
isUserLoggedIn(): boolean
```
**Ví dụ:**
```typescript
if (this.userInfoService.isUserLoggedIn()) {
  // User đã đăng nhập
  const userName = this.userInfoService.getCurrentUserFullName();
} else {
  // User chưa đăng nhập
  this.router.navigate(['/dang-nhap']);
}
```

#### 1.4. Lấy thông tin khác
```typescript
// Lấy email
const email = this.userInfoService.getCurrentUserEmail();

// Lấy username
const username = this.userInfoService.getCurrentUsername();

// Lấy roles
const roles = this.userInfoService.getCurrentUserRoles();

// Kiểm tra role cụ thể
const isAdmin = this.userInfoService.hasRole('admin');

// Lấy initials (chữ cái đầu)
const initials = this.userInfoService.getCurrentUserInitials();
```

## 2. DateFormatService

### Import Service

```typescript
import { DateFormatService } from '../services/date-format.service';

constructor(private dateFormatService: DateFormatService) {}
```

### Các phương thức chính

#### 2.1. Định dạng ngày theo chuẩn Việt Nam (DD/MM/YYYY)
```typescript
formatVietnameseDate(date: Date | string | number | null | undefined): string
```
**Ví dụ:**
```typescript
const date = new Date('2024-12-25');
const vietnameseDate = this.dateFormatService.formatVietnameseDate(date);
console.log(vietnameseDate); // "25/12/2024"

// Với string
const dateString = '2024-12-25T10:30:00';
const formatted = this.dateFormatService.formatVietnameseDate(dateString);
console.log(formatted); // "25/12/2024"
```

#### 2.2. Định dạng ngày giờ (DD/MM/YYYY HH:mm:ss)
```typescript
formatVietnameseDateTime(date: Date | string | number | null | undefined): string
```
**Ví dụ:**
```typescript
const date = new Date('2024-12-25T10:30:00');
const vietnameseDateTime = this.dateFormatService.formatVietnameseDateTime(date);
console.log(vietnameseDateTime); // "25/12/2024 10:30:00"
```

#### 2.3. Định dạng ngày giờ ngắn (DD/MM/YYYY HH:mm)
```typescript
formatVietnameseDateTimeShort(date: Date | string | number | null | undefined): string
```
**Ví dụ:**
```typescript
const date = new Date('2024-12-25T10:30:00');
const shortDateTime = this.dateFormatService.formatVietnameseDateTimeShort(date);
console.log(shortDateTime); // "25/12/2024 10:30"
```

#### 2.4. Định dạng thời gian (HH:mm:ss)
```typescript
formatVietnameseTime(date: Date | string | number | null | undefined): string
```
**Ví dụ:**
```typescript
const date = new Date('2024-12-25T10:30:00');
const time = this.dateFormatService.formatVietnameseTime(date);
console.log(time); // "10:30:00"
```

#### 2.5. Lấy ngày hiện tại theo múi giờ Việt Nam
```typescript
getCurrentVietnameseDate(): string
getCurrentVietnameseDateTime(): string
```
**Ví dụ:**
```typescript
const currentDate = this.dateFormatService.getCurrentVietnameseDate();
console.log(currentDate); // "25/12/2024"

const currentDateTime = this.dateFormatService.getCurrentVietnameseDateTime();
console.log(currentDateTime); // "25/12/2024 15:30:45"
```

#### 2.6. Chuyển đổi string ngày Việt Nam thành Date object
```typescript
parseVietnameseDate(vietnameseDateString: string): Date | null
```
**Ví dụ:**
```typescript
const vietnameseDateString = '25/12/2024';
const dateObj = this.dateFormatService.parseVietnameseDate(vietnameseDateString);
console.log(dateObj); // Date object representing 25/12/2024
```

## 3. Ví dụ sử dụng trong Component

### 3.1. Component đơn giản
```typescript
import { Component, OnInit } from '@angular/core';
import { UserInfoService } from '../services/user-info.service';
import { DateFormatService } from '../services/date-format.service';

@Component({
  selector: 'app-example',
  template: `
    <div *ngIf="isLoggedIn">
      <h2>Xin chào {{ userFullName }}!</h2>
      <p>Email: {{ userEmail }}</p>
      <p>Ngày đăng nhập: {{ loginDate }}</p>
      <p>Ngày hiện tại: {{ currentDate }}</p>
    </div>
    <div *ngIf="!isLoggedIn">
      <p>Vui lòng đăng nhập</p>
    </div>
  `
})
export class ExampleComponent implements OnInit {
  userFullName: string = '';
  userEmail: string = '';
  loginDate: string = '';
  currentDate: string = '';
  isLoggedIn: boolean = false;

  constructor(
    private userInfoService: UserInfoService,
    private dateFormatService: DateFormatService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  private loadUserInfo(): void {
    this.isLoggedIn = this.userInfoService.isUserLoggedIn();
    
    if (this.isLoggedIn) {
      this.userFullName = this.userInfoService.getCurrentUserFullName();
      this.userEmail = this.userInfoService.getCurrentUserEmail();
      
      const user = this.userInfoService.getCurrentUser();
      if (user?.lastLogin) {
        this.loginDate = this.dateFormatService.formatVietnameseDate(user.lastLogin);
      }
      
      this.currentDate = this.dateFormatService.getCurrentVietnameseDate();
    }
  }
}
```

### 3.2. Sử dụng trong Template với Pipe
```html
<!-- Hiển thị thông tin user -->
<div class="user-info">
  <h3>{{ userInfoService.getCurrentUserFullName() }}</h3>
  <p>{{ userInfoService.getCurrentUserEmail() }}</p>
  <p>Roles: {{ userInfoService.getCurrentUserRoles().join(', ') }}</p>
</div>

<!-- Hiển thị ngày tháng -->
<div class="date-info">
  <p>Ngày tạo: {{ user?.createdAt | date:'dd/MM/yyyy' }}</p>
  <p>Lần đăng nhập cuối: {{ user?.lastLogin | date:'dd/MM/yyyy HH:mm' }}</p>
  <p>Ngày hiện tại: {{ currentDate }}</p>
</div>
```

## 4. Sử dụng trong Service khác

```typescript
import { Injectable } from '@angular/core';
import { UserInfoService } from './user-info.service';
import { DateFormatService } from './date-format.service';

@Injectable({
  providedIn: 'root'
})
export class SomeOtherService {
  constructor(
    private userInfoService: UserInfoService,
    private dateFormatService: DateFormatService
  ) {}

  logUserActivity(): void {
    const user = this.userInfoService.getCurrentUser();
    const currentTime = this.dateFormatService.getCurrentVietnameseDateTime();
    
    console.log(`User ${user?.fullName} performed action at ${currentTime}`);
  }

  createRecord(): any {
    const user = this.userInfoService.getCurrentUser();
    const now = this.dateFormatService.getCurrentVietnamDate();
    
    return {
      createdBy: user?.fullName,
      createdAt: this.dateFormatService.formatVietnameseDate(now),
      createdByEmail: user?.email
    };
  }
}
```

## 5. Lưu ý quan trọng

### 5.1. Xử lý null/undefined
```typescript
// Luôn kiểm tra null/undefined
const user = this.userInfoService.getCurrentUser();
if (user) {
  const fullName = user.fullName || 'Không có tên';
  const email = user.email || 'Không có email';
}

// Với ngày tháng
const date = this.dateFormatService.formatVietnameseDate(someDate);
if (date) {
  console.log('Ngày hợp lệ:', date);
} else {
  console.log('Ngày không hợp lệ hoặc null');
}
```

### 5.2. Múi giờ Việt Nam
```typescript
// Luôn sử dụng múi giờ Việt Nam cho ngày hiện tại
const vietnamDate = this.dateFormatService.getCurrentVietnamDate();
const formattedDate = this.dateFormatService.formatVietnameseDate(vietnamDate);
```

### 5.3. Performance
```typescript
// Cache thông tin user nếu cần thiết
private cachedUser: User | null = null;

getCachedUser(): User | null {
  if (!this.cachedUser) {
    this.cachedUser = this.userInfoService.getCurrentUser();
  }
  return this.cachedUser;
}
```

## 6. Demo Component

Để xem ví dụ đầy đủ, hãy sử dụng `UserInfoDemoComponent` đã được tạo trong:
`src/app/components/user-info-demo/user-info-demo.component.ts`

Component này minh họa tất cả các tính năng của cả hai service.

