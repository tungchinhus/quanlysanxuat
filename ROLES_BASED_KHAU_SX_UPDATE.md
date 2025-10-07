# Update Logic: Roles-Based khau_sx Assignment

## Tổng quan

Đã cập nhật logic để ưu tiên sử dụng `roles` array thay vì `khau_sx` field để xác định loại công việc của user.

## Mapping Rules

### Roles → khau_sx Mapping:
- **`QUANDAYCAO`** → `quandaycao`
- **`QUANDAYHA`** → `quandayha`
- **`BOIDAYCAO`** → `quandaycao` (fallback)
- **`BOIDAYHA`** → `quandayha` (fallback)

## Files Updated

### 1. `src/app/components/ds-bangve/gia-cong-popup/gia-cong-popup.component.ts`

**Method:** `cleanAndValidateWorkerData()`

**Old Logic:**
```typescript
// Chỉ dựa vào khau_sx field
if (worker.khau_sx) {
  const khauSx = worker.khau_sx.toLowerCase().trim();
  if (khauSx.includes('boidayha')) {
    worker.khau_sx = 'quandayha';
  } else if (khauSx.includes('boidaycao')) {
    worker.khau_sx = 'quandaycao';
  }
}
```

**New Logic:**
```typescript
// Ưu tiên roles array, fallback về khau_sx
if (worker.roles && worker.roles.length > 0) {
  const rolesString = worker.roles.join(',').toLowerCase();
  
  if (rolesString.includes('quandaycao') || rolesString.includes('boidaycao')) {
    worker.khau_sx = 'quandaycao';
  } else if (rolesString.includes('quandayha') || rolesString.includes('boidayha')) {
    worker.khau_sx = 'quandayha';
  }
} else if (worker.khau_sx) {
  // Fallback: sử dụng khau_sx cũ
  const khauSx = worker.khau_sx.toLowerCase().trim();
  if (khauSx.includes('boidayha')) {
    worker.khau_sx = 'quandayha';
  } else if (khauSx.includes('boidaycao')) {
    worker.khau_sx = 'quandaycao';
  }
}
```

### 2. `src/app/components/ds-quan-day/ds-quan-day.component.ts`

**Method:** `determineUserRole()`

**Old Logic:**
```typescript
// Kiểm tra khau_sx trước, roles sau
this.isGiaCongHa = khauSx.includes('quandayha') || 
                   khauSx.includes('boidayha') || 
                   khauSx.includes('ha') ||
                   roleName.includes('boidayha') ||
                   roleName.includes('quandayha') ||
                   rolesString.includes('boidayha') ||
                   rolesString.includes('quandayha');
```

**New Logic:**
```typescript
// Ưu tiên roles array trước
this.isGiaCongHa = rolesString.includes('quandayha') ||
                   rolesString.includes('boidayha') ||
                   // Fallback: kiểm tra khau_sx và role_name
                   khauSx.includes('quandayha') || 
                   khauSx.includes('boidayha') || 
                   khauSx.includes('ha') ||
                   roleName.includes('boidayha') ||
                   roleName.includes('quandayha');
```

### 3. `src/app/components/ds-bangve/ds-bangve.component.ts`

**Method:** `redirectBasedOnKhauSx()`

**Old Logic:**
```typescript
// Chỉ dựa vào khau_sx
switch (this.khau_sx.toLowerCase()) {
  case 'boidayha':
    this.goBoidayHa(drawing);
    break;
  case 'boidaycao':
    this.goBoidayCao();
    break;
}
```

**New Logic:**
```typescript
// Ưu tiên roles array trước
const userInfo = this.authService.getUserInfo();
const userRoles = userInfo?.roles || [];
const rolesString = userRoles.join(',').toLowerCase();

if (rolesString.includes('quandaycao') || rolesString.includes('boidaycao')) {
  this.goBoidayCao();
  return;
} else if (rolesString.includes('quandayha') || rolesString.includes('boidayha')) {
  this.goBoidayHa(drawing);
  return;
}

// Fallback: kiểm tra khau_sx cũ
switch (this.khau_sx.toLowerCase()) {
  case 'boidayha':
    this.goBoidayHa(drawing);
    break;
  case 'boidaycao':
    this.goBoidayCao();
    break;
}
```

## Benefits

### 1. **Consistency**
- Tất cả components đều sử dụng cùng logic
- Ưu tiên `roles` array trước, fallback về `khau_sx`

### 2. **Flexibility**
- Hỗ trợ cả `QUANDAYCAO`/`QUANDAYHA` và `BOIDAYCAO`/`BOIDAYHA`
- Fallback về logic cũ nếu không có roles

### 3. **Debugging**
- Thêm console.log để trace logic
- Dễ dàng debug khi có vấn đề

## Testing

### Test Cases:

#### 1. User với role `QUANDAYCAO`:
```javascript
// Expected behavior:
// - gia-cong-popup: worker.khau_sx = 'quandaycao'
// - ds-quan-day: isGiaCongCao = true
// - ds-bangve: redirect to boidaycao
```

#### 2. User với role `QUANDAYHA`:
```javascript
// Expected behavior:
// - gia-cong-popup: worker.khau_sx = 'quandayha'
// - ds-quan-day: isGiaCongHa = true
// - ds-bangve: redirect to boidayha
```

#### 3. User không có roles (fallback):
```javascript
// Expected behavior:
// - Sử dụng khau_sx field như cũ
// - Logic cũ vẫn hoạt động
```

## Console Logs

### Debug logs được thêm:

1. **gia-cong-popup:**
   ```
   Updated workers with roles-based khau_sx: [
     {name: "user1", roles: ["QUANDAYCAO"], khau_sx: "quandaycao"},
     {name: "user2", roles: ["QUANDAYHA"], khau_sx: "quandayha"}
   ]
   ```

2. **ds-quan-day:**
   ```
   determineUserRole: Raw values - roles: ["QUANDAYCAO"], rolesString: "quandaycao", khau_sx: "", role_name: ""
   ```

3. **ds-bangve:**
   ```
   redirectBasedOnKhauSx: userRoles: ["QUANDAYCAO"], rolesString: "quandaycao"
   User has QUANDAYCAO role, redirecting to boidaycao
   ```

## Migration Guide

### For Existing Users:
1. **Không cần thay đổi gì** - logic cũ vẫn hoạt động
2. **Roles sẽ được ưu tiên** nếu có
3. **Fallback về khau_sx** nếu không có roles

### For New Users:
1. **Set roles array** trong Firebase user document
2. **Roles sẽ được sử dụng** thay vì khau_sx
3. **Khau_sx sẽ được tự động cập nhật** dựa trên roles

## Troubleshooting

### Common Issues:

1. **User không có roles:**
   - Kiểm tra Firebase user document
   - Đảm bảo roles array được set

2. **Roles không được nhận diện:**
   - Kiểm tra case sensitivity
   - Đảm bảo roles string đúng format

3. **Fallback không hoạt động:**
   - Kiểm tra khau_sx field
   - Đảm bảo logic cũ vẫn intact

## Future Enhancements

1. **Role Management UI:**
   - Interface để quản lý roles
   - Bulk update roles

2. **Role Validation:**
   - Validate roles khi tạo user
   - Prevent invalid role combinations

3. **Audit Trail:**
   - Log role changes
   - Track khau_sx updates
