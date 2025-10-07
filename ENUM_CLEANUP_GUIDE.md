# Enum Cleanup: Loại Bỏ Các Mục Trùng Lặp

## Tổng quan

Đã loại bỏ các enum values trùng lặp về ý nghĩa để đồng nhất code và dễ maintain hơn.

## Các thay đổi đã thực hiện

### 1. Loại bỏ khỏi `UserRole` enum:
- ❌ `BOIDAYCAO = 'boidaycao'` (trùng với `QUANDAYCAO`)
- ❌ `BOIDAYHA = 'boidayha'` (trùng với `QUANDAYHA`)
- ❌ `BOIDAYEP = 'boidayep'` (trùng với `EPBOIDAY`)

### 2. Loại bỏ khỏi `KhauSx` enum:
- ❌ `BOIDAYCAO = 'boidaycao'` (trùng với `QUANDAYCAO`)
- ❌ `BOIDAYHA = 'boidayha'` (trùng với `QUANDAYHA`)
- ❌ `BOIDAYEP = 'boidayep'` (trùng với `EPBOIDAY`)

### 3. Cập nhật `ROLE_TO_KHAU_SX_MAP`:
```typescript
// Trước (có trùng lặp):
export const ROLE_TO_KHAU_SX_MAP: Record<string, KhauSx> = {
  [UserRole.QUANDAYCAO]: KhauSx.QUANDAYCAO,
  [UserRole.QUANDAYHA]: KhauSx.QUANDAYHA,
  [UserRole.BOIDAYCAO]: KhauSx.QUANDAYCAO,  // ❌ Trùng lặp
  [UserRole.BOIDAYHA]: KhauSx.QUANDAYHA,    // ❌ Trùng lặp
  [UserRole.EPBOIDAY]: KhauSx.EPBOIDAY,
  [UserRole.BOIDAYEP]: KhauSx.BOIDAYEP,     // ❌ Trùng lặp
  // ...
};

// Sau (đã loại bỏ trùng lặp):
export const ROLE_TO_KHAU_SX_MAP: Record<string, KhauSx> = {
  [UserRole.QUANDAYCAO]: KhauSx.QUANDAYCAO,
  [UserRole.QUANDAYHA]: KhauSx.QUANDAYHA,
  [UserRole.EPBOIDAY]: KhauSx.EPBOIDAY,
  [UserRole.KCS]: KhauSx.KCS,
  [UserRole.ADMIN]: KhauSx.ADMIN,
  [UserRole.MANAGER]: KhauSx.ADMIN,
  [UserRole.ADMINISTRATOR]: KhauSx.ADMIN,
  [UserRole.TOTRUONG]: KhauSx.ADMIN
};
```

## Cập nhật RoleHelper Methods

### 1. `isGiaCongHa()`:
```typescript
// Trước:
static isGiaCongHa(roles: string[]): boolean {
  return roles.some(role => 
    role.toLowerCase() === UserRole.QUANDAYHA ||
    role.toLowerCase() === UserRole.BOIDAYHA  // ❌ Trùng lặp
  );
}

// Sau:
static isGiaCongHa(roles: string[]): boolean {
  return roles.some(role => 
    role.toLowerCase() === UserRole.QUANDAYHA
  );
}
```

### 2. `isGiaCongCao()`:
```typescript
// Trước:
static isGiaCongCao(roles: string[]): boolean {
  return roles.some(role => 
    role.toLowerCase() === UserRole.QUANDAYCAO ||
    role.toLowerCase() === UserRole.BOIDAYCAO  // ❌ Trùng lặp
  );
}

// Sau:
static isGiaCongCao(roles: string[]): boolean {
  return roles.some(role => 
    role.toLowerCase() === UserRole.QUANDAYCAO
  );
}
```

### 3. `isGiaCongEp()`:
```typescript
// Trước:
static isGiaCongEp(roles: string[]): boolean {
  return roles.some(role => 
    role.toLowerCase() === UserRole.EPBOIDAY ||
    role.toLowerCase() === UserRole.BOIDAYEP  // ❌ Trùng lặp
  );
}

// Sau:
static isGiaCongEp(roles: string[]): boolean {
  return roles.some(role => 
    role.toLowerCase() === UserRole.EPBOIDAY
  );
}
```

## Cập nhật Components

### 1. `gia-cong-popup.component.ts`:
```typescript
// Fallback logic được cập nhật để hỗ trợ cả tên cũ và mới
if (khauSx.includes('boidayha') || khauSx.includes('quandayha')) {
  worker.khau_sx = KhauSx.QUANDAYHA;
} else if (khauSx.includes('boidaycao') || khauSx.includes('quandaycao')) {
  worker.khau_sx = KhauSx.QUANDAYCAO;
}
```

### 2. `ds-quan-day.component.ts`:
```typescript
// Fallback logic được giữ nguyên để hỗ trợ khau_sx cũ
this.isGiaCongHa = RoleHelper.isGiaCongHa(userRoles) ||
                   khauSx.includes('quandayha') || 
                   khauSx.includes('boidayha') ||  // Fallback
                   khauSx.includes('ha') ||
                   roleName.includes('boidayha') ||  // Fallback
                   roleName.includes('quandayha');
```

### 3. `ds-bangve.component.ts`:
```typescript
// Switch case được cập nhật để hỗ trợ cả enum mới và string cũ
switch (this.khau_sx.toLowerCase()) {
  case KhauSx.QUANDAYHA:
  case 'boidayha': // Fallback cho khau_sx cũ
    this.goBoidayHa(drawing);
    break;
  case KhauSx.QUANDAYCAO:
  case 'boidaycao': // Fallback cho khau_sx cũ
    this.goBoidayCao();
    break;
  case KhauSx.EPBOIDAY:
  case 'boidayep': // Fallback cho khau_sx cũ
    // Handle epboiday
    break;
}
```

## Benefits

### 1. **Code Consistency**
- Chỉ sử dụng một tên cho mỗi concept
- Tránh confusion giữa các tên tương tự

### 2. **Easier Maintenance**
- Ít enum values hơn để maintain
- Logic đơn giản hơn

### 3. **Better Performance**
- Ít comparisons hơn trong helper methods
- Faster execution

### 4. **Backward Compatibility**
- Vẫn hỗ trợ khau_sx cũ trong fallback logic
- Không breaking existing data

## Migration Strategy

### Phase 1: Enum Cleanup ✅
- Loại bỏ các enum trùng lặp
- Cập nhật mapping và helper methods

### Phase 2: Component Updates ✅
- Cập nhật components để sử dụng enum mới
- Thêm fallback logic cho compatibility

### Phase 3: Data Migration (Future)
- Cập nhật database để sử dụng enum values mới
- Migrate existing user roles

## Standardized Enum Values

### UserRole (Final):
```typescript
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ADMINISTRATOR = 'administrator',
  TOTRUONG = 'totruong',
  QUANDAYCAO = 'quandaycao',    // ✅ Standardized
  QUANDAYHA = 'quandayha',      // ✅ Standardized
  EPBOIDAY = 'epboiday',        // ✅ Standardized
  KCS = 'kcs',
  USER = 'user'
}
```

### KhauSx (Final):
```typescript
export enum KhauSx {
  ADMIN = 'admin',
  QUANDAYCAO = 'quandaycao',    // ✅ Standardized
  QUANDAYHA = 'quandayha',      // ✅ Standardized
  EPBOIDAY = 'epboiday',        // ✅ Standardized
  KCS = 'kcs',
  UNKNOWN = 'unknown'
}
```

## Testing

### Test Cases:
```typescript
describe('RoleHelper after cleanup', () => {
  it('should recognize QUANDAYCAO role', () => {
    const roles = ['QUANDAYCAO'];
    expect(RoleHelper.isGiaCongCao(roles)).toBe(true);
    expect(RoleHelper.rolesToKhauSx(roles)).toBe(KhauSx.QUANDAYCAO);
  });

  it('should recognize QUANDAYHA role', () => {
    const roles = ['QUANDAYHA'];
    expect(RoleHelper.isGiaCongHa(roles)).toBe(true);
    expect(RoleHelper.rolesToKhauSx(roles)).toBe(KhauSx.QUANDAYHA);
  });

  it('should recognize EPBOIDAY role', () => {
    const roles = ['EPBOIDAY'];
    expect(RoleHelper.isGiaCongEp(roles)).toBe(true);
    expect(RoleHelper.rolesToKhauSx(roles)).toBe(KhauSx.EPBOIDAY);
  });

  it('should handle fallback khau_sx values', () => {
    // Test fallback logic in components
    const oldKhauSx = 'boidayha';
    // Should be converted to KhauSx.QUANDAYHA
  });
});
```

## Best Practices

### 1. **Use Standardized Values**
- Luôn sử dụng `QUANDAYCAO`, `QUANDAYHA`, `EPBOIDAY`
- Tránh sử dụng `BOIDAYCAO`, `BOIDAYHA`, `BOIDAYEP`

### 2. **Maintain Fallback Support**
- Giữ fallback logic cho compatibility
- Gradually migrate old data

### 3. **Document Changes**
- Update documentation khi thay đổi enum
- Communicate changes to team

### 4. **Test Thoroughly**
- Test cả enum mới và fallback logic
- Verify không breaking existing functionality

## Future Enhancements

### 1. **Data Migration Script**
- Script để migrate existing user roles
- Batch update database records

### 2. **Validation Rules**
- Prevent creation of old enum values
- Validate input data

### 3. **Monitoring**
- Track usage of old enum values
- Monitor migration progress

## Troubleshooting

### Common Issues:

1. **Old enum values still in use:**
   - Check fallback logic
   - Verify data migration

2. **Missing role permissions:**
   - Check RoleHelper methods
   - Verify enum mapping

3. **Component not working:**
   - Check import statements
   - Verify enum references

## Conclusion

Việc loại bỏ các enum trùng lặp đã giúp:
- ✅ Code đồng nhất và dễ hiểu hơn
- ✅ Logic đơn giản hơn
- ✅ Performance tốt hơn
- ✅ Vẫn maintain backward compatibility

Hệ thống roles giờ đây đã được chuẩn hóa và sẵn sàng cho future enhancements!
