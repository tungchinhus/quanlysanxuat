# Worker Filter Logic Fix: Sửa Logic Filter nguoiGiaCongOptions

## Tổng quan

Đã sửa logic filter cho `nguoiGiaCongOptions` để dựa vào `khau_sx` thay vì `role === 'user'`, vì workers có `role` là `quandaycao`, `quandayha` chứ không phải `user`.

## Vấn đề được phát hiện

### Debugger Analysis:
```typescript
// ❌ Vấn đề: nguoiGiaCongOptions là empty array
this.nguoiGiaCongOptions = Array(0) // length: 0

// ❌ Logic cũ không đúng:
this.nguoiGiaCongOptions = workers.filter(worker => worker.role === 'user');
```

### Worker Data Structure:
```typescript
// Workers từ database có structure:
{
  role: 'quandaycao',     // ✅ Không phải 'user'
  roles: ['quandaycao'],  // ✅ Array of roles
  khau_sx: 'quandaycao',  // ✅ Derived from roles
  name: 'dat2025',
  email: 'dat2025@thibidi.com'
}
```

## Giải pháp đã thực hiện

### 1. Cập nhật Filter Logic:

#### Trước (có vấn đề):
```typescript
// ❌ Logic cũ - filter quá hạn chế
this.nguoiGiaCongOptions = workers.filter(worker => worker.role === 'user');

// ❌ Duplicate filtering
this.nguoiGiaCongOptions = workers.filter(worker => {
  const roles = (worker.roles || (worker.role ? [worker.role] : [])).map(r => r.toLowerCase());
  return !roles.includes('admin') && !roles.includes('manager') && !roles.includes('administrator');
});

this.nguoiGiaCongOptions = workers.filter(worker => 
  worker.khau_sx === 'quandayha' || 
  worker.khau_sx === 'quandaycao' || 
  worker.khau_sx === 'epboiday'
);
```

#### Sau (đã sửa):
```typescript
// ✅ Logic mới - filter dựa vào khau_sx và loại bỏ admin
this.nguoiGiaCongOptions = workers.filter(worker => {
  // Loại bỏ admin/manager/administrator
  const roles = (worker.roles || (worker.role ? [worker.role] : [])).map(r => r.toLowerCase());
  const isNotAdmin = !roles.includes('admin') && !roles.includes('manager') && !roles.includes('administrator');
  
  // Chỉ lấy workers có khau_sx phù hợp
  const hasValidKhauSx = worker.khau_sx === 'quandayha' || 
                         worker.khau_sx === 'quandaycao' || 
                         worker.khau_sx === 'epboiday';
  
  return isNotAdmin && hasValidKhauSx;
});
```

### 2. Consistent Filtering cho Specific Roles:

```typescript
// ✅ Filter workers cho từng loại gia công
this.quandayhaUsers = workers.filter(worker => worker.khau_sx === 'quandayha');
this.quandaycaoUsers = workers.filter(worker => worker.khau_sx === 'quandaycao');
```

## Data Flow mới

### 1. **Workers từ getWorkers():**
```typescript
const workers = [
  {
    role: 'quandaycao',
    roles: ['quandaycao'],
    khau_sx: 'quandaycao',
    name: 'dat2025',
    email: 'dat2025@thibidi.com'
  },
  {
    role: 'quandayha', 
    roles: ['quandayha'],
    khau_sx: 'quandayha',
    name: 'user2',
    email: 'user2@thibidi.com'
  },
  {
    role: 'admin',
    roles: ['admin'],
    khau_sx: 'admin',
    name: 'admin',
    email: 'admin@thibidi.com'
  }
];
```

### 2. **Filtered Results:**
```typescript
// nguoiGiaCongOptions: Workers có khau_sx phù hợp và không phải admin
this.nguoiGiaCongOptions = [
  {
    role: 'quandaycao',
    roles: ['quandaycao'],
    khau_sx: 'quandaycao',
    name: 'dat2025',
    email: 'dat2025@thibidi.com'
  },
  {
    role: 'quandayha',
    roles: ['quandayha'], 
    khau_sx: 'quandayha',
    name: 'user2',
    email: 'user2@thibidi.com'
  }
];

// quandayhaUsers: Chỉ workers cho gia công hạ
this.quandayhaUsers = [
  {
    role: 'quandayha',
    roles: ['quandayha'],
    khau_sx: 'quandayha',
    name: 'user2',
    email: 'user2@thibidi.com'
  }
];

// quandaycaoUsers: Chỉ workers cho gia công cao
this.quandaycaoUsers = [
  {
    role: 'quandaycao',
    roles: ['quandaycao'],
    khau_sx: 'quandaycao',
    name: 'dat2025',
    email: 'dat2025@thibidi.com'
  }
];
```

## Test Cases

### 1. **Workers với valid khau_sx:**
```typescript
const workers = [
  { role: 'quandaycao', khau_sx: 'quandaycao', roles: ['quandaycao'] },
  { role: 'quandayha', khau_sx: 'quandayha', roles: ['quandayha'] },
  { role: 'epboiday', khau_sx: 'epboiday', roles: ['epboiday'] }
];

// Expected results:
// nguoiGiaCongOptions.length = 3
// quandayhaUsers.length = 1
// quandaycaoUsers.length = 1
```

### 2. **Workers với admin roles:**
```typescript
const workers = [
  { role: 'admin', khau_sx: 'admin', roles: ['admin'] },
  { role: 'quandaycao', khau_sx: 'quandaycao', roles: ['quandaycao'] }
];

// Expected results:
// nguoiGiaCongOptions.length = 1 (admin bị loại bỏ)
// quandaycaoUsers.length = 1
```

### 3. **Workers với invalid khau_sx:**
```typescript
const workers = [
  { role: 'user', khau_sx: 'unknown', roles: ['user'] },
  { role: 'quandaycao', khau_sx: 'quandaycao', roles: ['quandaycao'] }
];

// Expected results:
// nguoiGiaCongOptions.length = 1 (unknown khau_sx bị loại bỏ)
// quandaycaoUsers.length = 1
```

## Benefits

### 1. **Correct Filtering**
- ✅ Dựa vào `khau_sx` thay vì `role === 'user'`
- ✅ Loại bỏ admin/manager/administrator
- ✅ Chỉ lấy workers phù hợp cho gia công

### 2. **Consistent Logic**
- ✅ Single filter logic thay vì duplicate
- ✅ Clear và understandable
- ✅ Maintainable code

### 3. **Proper Data Structure**
- ✅ `nguoiGiaCongOptions` không còn empty
- ✅ `quandayhaUsers` và `quandaycaoUsers` có data
- ✅ Form validation sẽ hoạt động đúng

## Code Comparison

### Before (Problematic):
```typescript
// ❌ Filter quá hạn chế
this.nguoiGiaCongOptions = workers.filter(worker => worker.role === 'user');

// ❌ Duplicate filtering
this.nguoiGiaCongOptions = workers.filter(worker => /* admin check */);
this.nguoiGiaCongOptions = workers.filter(worker => /* khau_sx check */);

// Result: nguoiGiaCongOptions = [] (empty array)
```

### After (Fixed):
```typescript
// ✅ Single comprehensive filter
this.nguoiGiaCongOptions = workers.filter(worker => {
  const roles = (worker.roles || (worker.role ? [worker.role] : [])).map(r => r.toLowerCase());
  const isNotAdmin = !roles.includes('admin') && !roles.includes('manager') && !roles.includes('administrator');
  
  const hasValidKhauSx = worker.khau_sx === 'quandayha' || 
                         worker.khau_sx === 'quandaycao' || 
                         worker.khau_sx === 'epboiday';
  
  return isNotAdmin && hasValidKhauSx;
});

// Result: nguoiGiaCongOptions = [valid workers] (populated array)
```

## Debugging Tips

### 1. **Check Worker Data:**
```typescript
console.log('All workers:', workers);
console.log('Worker roles:', workers.map(w => w.roles));
console.log('Worker khau_sx:', workers.map(w => w.khau_sx));
```

### 2. **Check Filter Results:**
```typescript
console.log('nguoiGiaCongOptions:', this.nguoiGiaCongOptions);
console.log('quandayhaUsers:', this.quandayhaUsers);
console.log('quandaycaoUsers:', this.quandaycaoUsers);
```

### 3. **Check Filter Logic:**
```typescript
workers.forEach(worker => {
  const roles = (worker.roles || (worker.role ? [worker.role] : [])).map(r => r.toLowerCase());
  const isNotAdmin = !roles.includes('admin') && !roles.includes('manager') && !roles.includes('administrator');
  const hasValidKhauSx = worker.khau_sx === 'quandayha' || worker.khau_sx === 'quandaycao' || worker.khau_sx === 'epboiday';
  
  console.log(`Worker ${worker.name}: isNotAdmin=${isNotAdmin}, hasValidKhauSx=${hasValidKhauSx}, result=${isNotAdmin && hasValidKhauSx}`);
});
```

## Best Practices

### 1. **Use khau_sx for Filtering:**
```typescript
// ✅ Good: Filter based on khau_sx
worker.khau_sx === 'quandaycao'

// ❌ Bad: Filter based on generic role
worker.role === 'user'
```

### 2. **Combine Multiple Conditions:**
```typescript
// ✅ Good: Single filter with multiple conditions
workers.filter(worker => {
  const condition1 = /* admin check */;
  const condition2 = /* khau_sx check */;
  return condition1 && condition2;
});

// ❌ Bad: Multiple separate filters
workers.filter(/* condition1 */).filter(/* condition2 */);
```

### 3. **Validate Data Structure:**
```typescript
// ✅ Good: Check data before filtering
if (workers && workers.length > 0) {
  this.nguoiGiaCongOptions = workers.filter(/* conditions */);
}

// ❌ Bad: Assume data exists
this.nguoiGiaCongOptions = workers.filter(/* conditions */);
```

## Troubleshooting

### Common Issues:

1. **nguoiGiaCongOptions still empty:**
   - Check if workers have correct khau_sx values
   - Verify admin filtering logic
   - Check console logs for debugging

2. **Form validation not working:**
   - Check if nguoiGiaCongOptions has data
   - Verify form initialization
   - Check error messages

3. **Wrong workers in lists:**
   - Check khau_sx values in workers
   - Verify filter conditions
   - Check role mapping

## Conclusion

Việc sửa logic filter đã giải quyết:
- ✅ **Empty Array Issue**: nguoiGiaCongOptions không còn empty
- ✅ **Correct Filtering**: Dựa vào khau_sx thay vì role === 'user'
- ✅ **Consistent Logic**: Single filter thay vì duplicate
- ✅ **Proper Data Flow**: Workers được filter đúng cách

Hệ thống giờ đây sẽ hiển thị đúng danh sách workers cho gia công! 🚀
