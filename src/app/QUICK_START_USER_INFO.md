# Hướng dẫn nhanh: Lấy thông tin User và định dạng ngày tháng

## 🚀 Sử dụng nhanh

### 1. Import Services
```typescript
import { UserInfoService } from '../services/user-info.service';
import { DateFormatService } from '../services/date-format.service';

constructor(
  private userInfoService: UserInfoService,
  private dateFormatService: DateFormatService
) {}
```

### 2. Lấy thông tin User
```typescript
// Họ tên đầy đủ
const fullName = this.userInfoService.getCurrentUserFullName();

// Email
const email = this.userInfoService.getCurrentUserEmail();

// Username
const username = this.userInfoService.getCurrentUsername();

// Roles
const roles = this.userInfoService.getCurrentUserRoles();

// Kiểm tra đăng nhập
const isLoggedIn = this.userInfoService.isUserLoggedIn();

// Kiểm tra role
const isAdmin = this.userInfoService.hasRole('admin');
```

### 3. Định dạng ngày tháng Việt Nam
```typescript
// Ngày hiện tại (DD/MM/YYYY)
const today = this.dateFormatService.getCurrentVietnameseDate();

// Ngày giờ hiện tại (DD/MM/YYYY HH:mm:ss)
const now = this.dateFormatService.getCurrentVietnameseDateTime();

// Định dạng ngày bất kỳ
const formattedDate = this.dateFormatService.formatVietnameseDate(someDate);

// Định dạng ngày giờ
const formattedDateTime = this.dateFormatService.formatVietnameseDateTime(someDate);
```

### 4. Sử dụng trong Template
```html
<!-- Thông tin user -->
<p>Xin chào {{ userInfoService.getCurrentUserFullName() }}!</p>
<p>Email: {{ userInfoService.getCurrentUserEmail() }}</p>
<p>Roles: {{ userInfoService.getCurrentUserRoles().join(', ') }}</p>

<!-- Ngày tháng -->
<p>Hôm nay: {{ dateFormatService.getCurrentVietnameseDate() }}</p>
<p>Bây giờ: {{ dateFormatService.getCurrentVietnameseDateTime() }}</p>
<p>Ngày tạo: {{ user?.createdAt | date:'dd/MM/yyyy' }}</p>
```

## 📝 Ví dụ Component đơn giản

```typescript
export class MyComponent implements OnInit {
  userFullName: string = '';
  currentDate: string = '';

  constructor(
    private userInfoService: UserInfoService,
    private dateFormatService: DateFormatService
  ) {}

  ngOnInit(): void {
    this.userFullName = this.userInfoService.getCurrentUserFullName();
    this.currentDate = this.dateFormatService.getCurrentVietnameseDate();
  }
}
```

## 🎯 Các phương thức chính

### UserInfoService
- `getCurrentUserFullName()` - Họ tên đầy đủ
- `getCurrentUser()` - Thông tin user đầy đủ
- `isUserLoggedIn()` - Kiểm tra đăng nhập
- `getCurrentUserEmail()` - Email
- `getCurrentUsername()` - Username
- `getCurrentUserRoles()` - Danh sách roles
- `hasRole(roleName)` - Kiểm tra role cụ thể
- `getCurrentUserInitials()` - Chữ cái đầu

### DateFormatService
- `formatVietnameseDate(date)` - DD/MM/YYYY
- `formatVietnameseDateTime(date)` - DD/MM/YYYY HH:mm:ss
- `formatVietnameseDateTimeShort(date)` - DD/MM/YYYY HH:mm
- `formatVietnameseTime(date)` - HH:mm:ss
- `getCurrentVietnameseDate()` - Ngày hiện tại
- `getCurrentVietnameseDateTime()` - Ngày giờ hiện tại
- `parseVietnameseDate(string)` - Chuyển string thành Date

## ⚠️ Lưu ý quan trọng

1. **Luôn kiểm tra null/undefined:**
```typescript
const user = this.userInfoService.getCurrentUser();
if (user) {
  // Sử dụng user
}
```

2. **Xử lý ngày không hợp lệ:**
```typescript
const formattedDate = this.dateFormatService.formatVietnameseDate(someDate);
if (formattedDate) {
  // Ngày hợp lệ
} else {
  // Ngày không hợp lệ
}
```

3. **Múi giờ Việt Nam:**
```typescript
// Luôn sử dụng múi giờ Việt Nam
const vietnamDate = this.dateFormatService.getCurrentVietnamDate();
```

## 📁 Files đã tạo

- `src/app/services/user-info.service.ts` - Service lấy thông tin user
- `src/app/services/date-format.service.ts` - Service định dạng ngày tháng
- `src/app/components/user-info-demo/user-info-demo.component.ts` - Component demo đầy đủ
- `src/app/examples/user-info-simple-example.ts` - Ví dụ đơn giản
- `src/app/USER_INFO_USAGE_GUIDE.md` - Hướng dẫn chi tiết

## 🔧 Cách thêm vào component hiện tại

1. Import services vào component
2. Inject vào constructor
3. Sử dụng trong ngOnInit() hoặc các phương thức khác
4. Hiển thị trong template

**Ví dụ nhanh:**
```typescript
ngOnInit(): void {
  const userName = this.userInfoService.getCurrentUserFullName();
  const today = this.dateFormatService.getCurrentVietnameseDate();
  console.log(`${userName} - ${today}`);
}
```

