# 🚨 Hướng dẫn khôi phục quyền Super Admin

## 🎯 **Vấn đề:**
User `chinhdvt@thibidi.com` bị mất quyền `super_admin` và chỉ còn role `user`, dẫn đến các lỗi "Missing or insufficient permissions" trong console.

## 🔧 **Giải pháp:**

### **Phương pháp 1: Sử dụng Debug Component (Khuyến nghị)**

1. **Truy cập Debug Component:**
   - Vào trang debug admin: `/debug-admin`
   - Hoặc truy cập trực tiếp component debug

2. **Sử dụng các button khôi phục:**
   - **"Auto Restore Super Admin"**: Tự động khôi phục cho `chinhdvt@thibidi.com`
   - **"Emergency Super Admin Fix"**: Khôi phục khẩn cấp với nhiều phương pháp
   - **"Restore Super Admin"**: Khôi phục thủ công (nhập email vào field)

### **Phương pháp 2: Emergency Fix (Nếu phương pháp 1 không hoạt động)**

1. **Cập nhật localStorage trực tiếp:**
   ```javascript
   // Mở Developer Console (F12)
   const currentUser = JSON.parse(localStorage.getItem('currentUser'));
   currentUser.roles = ['super_admin'];
   localStorage.setItem('currentUser', JSON.stringify(currentUser));
   location.reload(); // Reload trang
   ```

2. **Tạo temporary super admin:**
   - Sử dụng button "Emergency Super Admin Fix"
   - Đăng nhập với: `temp_superadmin@thibidi.com` / `Emergency123!`
   - Sau đó khôi phục user gốc

### **Phương pháp 3: Firebase Console (Nếu có quyền truy cập)**

1. **Truy cập Firebase Console:**
   - Vào Firestore Database
   - Tìm collection `users`
   - Tìm document của user `chinhdvt@thibidi.com`

2. **Cập nhật roles:**
   ```json
   {
     "roles": ["super_admin"],
     "updatedAt": "2024-01-XX",
     "updatedBy": "manual_fix"
   }
   ```

## 🛠️ **Các method đã implement:**

### **1. `restoreSuperAdmin()`**
- Tìm user theo email
- Cập nhật role thành `super_admin`
- Refresh user data
- Fallback: Tạo user mới nếu không thể update

### **2. `autoRestoreSuperAdmin()`**
- Tự động set email `chinhdvt@thibidi.com`
- Gọi `restoreSuperAdmin()`
- Thông báo kết quả

### **3. `emergencySuperAdminFix()`**
- **Method 1**: Cập nhật localStorage trực tiếp
- **Method 2**: Tạo temporary super admin
- **Method 3**: Force refresh user data
- Áp dụng nhiều phương pháp cùng lúc

## 🔍 **Debug Information:**

### **Console Logs để theo dõi:**
```javascript
// Khi khôi phục thành công:
"User chinhdvt@thibidi.com restored to super admin successfully!"

// Khi có lỗi permissions:
"Permission error, trying alternative method: FirebaseError: Missing or insufficient permissions"

// Khi emergency fix:
"🚨 EMERGENCY SUPER ADMIN FIX - Attempting to restore permissions..."
```

### **Kiểm tra trạng thái:**
- **Current user roles**: Hiển thị trong debug component
- **Is authenticated**: Phải là `YES`
- **Token valid**: Phải là `YES`
- **Admin exists**: Phải là `YES`

## ⚠️ **Lưu ý quan trọng:**

1. **Firestore Rules**: Có thể cần quyền `super_admin` để update user
2. **Race Condition**: Có thể cần reload trang sau khi khôi phục
3. **Backup**: Nên backup user data trước khi thay đổi
4. **Testing**: Test lại các chức năng admin sau khi khôi phục

## 🚀 **Các bước thực hiện:**

1. **Bước 1**: Truy cập debug component
2. **Bước 2**: Click "Auto Restore Super Admin"
3. **Bước 3**: Kiểm tra console logs
4. **Bước 4**: Nếu thất bại, thử "Emergency Super Admin Fix"
5. **Bước 5**: Reload trang và kiểm tra quyền
6. **Bước 6**: Test các chức năng admin

## 📞 **Hỗ trợ:**

Nếu các phương pháp trên không hoạt động:
1. Kiểm tra Firestore rules
2. Kiểm tra Firebase Authentication
3. Liên hệ developer để hỗ trợ trực tiếp

---

**Lưu ý**: Đây là giải pháp khẩn cấp để khôi phục quyền super admin. Sau khi khôi phục thành công, nên kiểm tra và cải thiện hệ thống để tránh vấn đề tương tự trong tương lai.
