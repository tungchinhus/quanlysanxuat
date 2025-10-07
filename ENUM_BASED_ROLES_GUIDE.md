# Enum-Based Roles System Guide

## Tổng quan

Đã chuyển đổi hệ thống roles từ string literals sang enum để dễ maintain và update hơn.

## Files Created/Updated

### 1. `src/app/models/user-roles.enum.ts` (NEW)

**Enums:**
- `UserRole`: Định nghĩa tất cả các role có thể có
- `KhauSx`: Định nghĩa các khâu sản xuất
- `ROLE_TO_KHAU_SX_MAP`: Mapping từ role sang khau_sx

**Helper Class:**
- `RoleHelper`: Chứa các utility methods để làm việc với roles

### 2. Updated Components

- `gia-cong-popup.component.ts`
- `ds-quan-day.component.ts` 
- `ds-bangve.component.ts`

## Enum Definitions

### UserRole Enum
```typescript
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ADMINISTRATOR = 'administrator',
  TOTRUONG = 'totruong',
  QUANDAYCAO = 'quandaycao',
  QUANDAYHA = 'quandayha',
  BOIDAYCAO = 'boidaycao',
  BOIDAYHA = 'boidayha',
  EPBOIDAY = 'epboiday',
  BOIDAYEP = 'boidayep',
  KCS = 'kcs',
  USER = 'user'
}
```

### KhauSx Enum
```typescript
export enum KhauSx {
  ADMIN = 'admin',
  QUANDAYCAO = 'quandaycao',
  QUANDAYHA = 'quandayha',
  BOIDAYCAO = 'boidaycao',
  BOIDAYHA = 'boidayha',
  EPBOIDAY = 'epboiday',
  BOIDAYEP = 'boidayep',
  KCS = 'kcs',
  UNKNOWN = 'unknown'
}
```

## RoleHelper Methods

### 1. `rolesToKhauSx(roles: string[]): KhauSx`
Chuyển đổi roles array sang khau_sx enum value.

```typescript
const roles = ['QUANDAYCAO'];
const khauSx = RoleHelper.rolesToKhauSx(roles); // Returns KhauSx.QUANDAYCAO
```

### 2. `isAdminOrManager(roles: string[]): boolean`
Kiểm tra user có quyền admin/manager không.

```typescript
const roles = ['admin', 'manager'];
const isAdmin = RoleHelper.isAdminOrManager(roles); // Returns true
```

### 3. `isGiaCongHa(roles: string[]): boolean`
Kiểm tra user có quyền gia công hạ không.

```typescript
const roles = ['QUANDAYHA', 'BOIDAYHA'];
const isGiaCongHa = RoleHelper.isGiaCongHa(roles); // Returns true
```

### 4. `isGiaCongCao(roles: string[]): boolean`
Kiểm tra user có quyền gia công cao không.

```typescript
const roles = ['QUANDAYCAO', 'BOIDAYCAO'];
const isGiaCongCao = RoleHelper.isGiaCongCao(roles); // Returns true
```

### 5. `isGiaCongEp(roles: string[]): boolean`
Kiểm tra user có quyền gia công ép không.

```typescript
const roles = ['EPBOIDAY', 'BOIDAYEP'];
const isGiaCongEp = RoleHelper.isGiaCongEp(roles); // Returns true
```

### 6. `isKCS(roles: string[]): boolean`
Kiểm tra user có quyền KCS không.

```typescript
const roles = ['KCS'];
const isKCS = RoleHelper.isKCS(roles); // Returns true
```

### 7. `normalizeRoles(roles: string[]): string[]`
Chuẩn hóa roles array (lowercase, loại bỏ duplicate).

```typescript
const roles = ['ADMIN', 'admin', 'Manager'];
const normalized = RoleHelper.normalizeRoles(roles); // Returns ['admin', 'manager']
```

### 8. `isValidRole(role: string): boolean`
Validate role string.

```typescript
const isValid = RoleHelper.isValidRole('admin'); // Returns true
const isInvalid = RoleHelper.isValidRole('invalid'); // Returns false
```

### 9. `getRoleDisplayName(role: string): string`
Lấy display name cho role.

```typescript
const displayName = RoleHelper.getRoleDisplayName('admin'); // Returns 'Quản trị viên'
```

### 10. `getKhauSxDisplayName(khauSx: KhauSx): string`
Lấy display name cho khau_sx.

```typescript
const displayName = RoleHelper.getKhauSxDisplayName(KhauSx.QUANDAYCAO); // Returns 'Quấn dây cao'
```

## Usage Examples

### 1. Trong Component

```typescript
import { UserRole, KhauSx, RoleHelper } from '../../../models/user-roles.enum';

// Kiểm tra quyền
const userRoles = ['QUANDAYCAO'];
if (RoleHelper.isGiaCongCao(userRoles)) {
  // User có quyền gia công cao
}

// Chuyển đổi roles sang khau_sx
const khauSx = RoleHelper.rolesToKhauSx(userRoles);
console.log(khauSx); // 'quandaycao'

// Kiểm tra admin
if (RoleHelper.isAdminOrManager(userRoles)) {
  // User là admin/manager
}
```

### 2. Trong Service

```typescript
import { UserRole, KhauSx, RoleHelper } from '../models/user-roles.enum';

// Validate roles
const roles = ['admin', 'manager'];
const validRoles = roles.filter(role => RoleHelper.isValidRole(role));

// Get display names
const displayNames = roles.map(role => RoleHelper.getRoleDisplayName(role));
```

## Benefits

### 1. **Type Safety**
- TypeScript sẽ cảnh báo nếu sử dụng role không tồn tại
- IntelliSense hỗ trợ autocomplete

### 2. **Maintainability**
- Chỉ cần update enum khi thêm role mới
- Tất cả references sẽ được update tự động

### 3. **Consistency**
- Đảm bảo tất cả components sử dụng cùng format
- Tránh typo và inconsistency

### 4. **Refactoring**
- Dễ dàng rename roles
- IDE hỗ trợ find/replace toàn bộ codebase

### 5. **Documentation**
- Enum values tự document
- Helper methods có JSDoc comments

## Migration Guide

### Before (String Literals):
```typescript
// Old way
if (role === 'admin' || role === 'manager') {
  // Admin logic
}

if (khauSx.includes('quandaycao')) {
  // Gia cong cao logic
}
```

### After (Enums):
```typescript
// New way
import { UserRole, KhauSx, RoleHelper } from '../models/user-roles.enum';

if (RoleHelper.isAdminOrManager(roles)) {
  // Admin logic
}

if (RoleHelper.isGiaCongCao(roles)) {
  // Gia cong cao logic
}
```

## Adding New Roles

### 1. Add to UserRole Enum:
```typescript
export enum UserRole {
  // ... existing roles
  NEW_ROLE = 'new_role'
}
```

### 2. Add to KhauSx Enum (if needed):
```typescript
export enum KhauSx {
  // ... existing values
  NEW_KHAU_SX = 'new_khau_sx'
}
```

### 3. Update ROLE_TO_KHAU_SX_MAP:
```typescript
export const ROLE_TO_KHAU_SX_MAP: Record<string, KhauSx> = {
  // ... existing mappings
  [UserRole.NEW_ROLE]: KhauSx.NEW_KHAU_SX
};
```

### 4. Add Helper Method (if needed):
```typescript
static isNewRole(roles: string[]): boolean {
  return roles.some(role => 
    role.toLowerCase() === UserRole.NEW_ROLE
  );
}
```

### 5. Update Display Names:
```typescript
const roleDisplayNames: Record<string, string> = {
  // ... existing names
  [UserRole.NEW_ROLE]: 'New Role Display Name'
};
```

## Testing

### Unit Tests:
```typescript
describe('RoleHelper', () => {
  it('should convert roles to khau_sx correctly', () => {
    const roles = ['QUANDAYCAO'];
    const result = RoleHelper.rolesToKhauSx(roles);
    expect(result).toBe(KhauSx.QUANDAYCAO);
  });

  it('should check admin permissions correctly', () => {
    const adminRoles = ['admin', 'manager'];
    const userRoles = ['user'];
    
    expect(RoleHelper.isAdminOrManager(adminRoles)).toBe(true);
    expect(RoleHelper.isAdminOrManager(userRoles)).toBe(false);
  });
});
```

## Best Practices

### 1. **Always Use Enums**
- Không sử dụng string literals trực tiếp
- Import enums từ central location

### 2. **Use Helper Methods**
- Sử dụng `RoleHelper` methods thay vì tự implement logic
- Đảm bảo consistency across components

### 3. **Validate Input**
- Luôn validate roles trước khi sử dụng
- Sử dụng `isValidRole()` method

### 4. **Handle Edge Cases**
- Luôn có fallback cho unknown roles
- Handle empty/null roles arrays

### 5. **Document Changes**
- Update documentation khi thêm roles mới
- Comment complex role logic

## Troubleshooting

### Common Issues:

1. **Import Conflicts:**
   - Sử dụng alias: `import { UserRole as UserRoleEnum }`
   - Rename local interfaces

2. **Type Errors:**
   - Đảm bảo roles array có type `string[]`
   - Cast enum values khi cần thiết

3. **Runtime Errors:**
   - Validate roles trước khi sử dụng
   - Handle null/undefined cases

## Future Enhancements

1. **Role Hierarchy:**
   - Implement role hierarchy system
   - Permission inheritance

2. **Dynamic Roles:**
   - Load roles from database
   - Runtime role configuration

3. **Role Groups:**
   - Group related roles together
   - Bulk permission checking

4. **Audit Trail:**
   - Log role changes
   - Track permission usage
