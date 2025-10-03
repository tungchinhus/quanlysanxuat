# 🔍 Hướng dẫn Debug vấn đề reload mất role

## 🎯 **Vấn đề:**
Reload page vẫn bị mất role admin → chuyển thành user

## 🔧 **Cách debug:**

### **Bước 1: Mở Developer Tools**
1. **F12** hoặc **Right-click → Inspect**
2. **Chuyển sang tab Console**

### **Bước 2: Reload page và xem console logs**
1. **Reload page** (Ctrl+F5)
2. **Xem console logs** theo thứ tự:

#### **Logs mong đợi:**
```
Auth data loaded from localStorage: {id: "abc123", email: "admin@example.com", roles: ["admin"]}
Scheduling user data refresh in 1 second...
Starting scheduled user data refresh...
Refreshing user data from Firestore for: admin@example.com
Current user roles: ["admin"]
Total users loaded from Firestore: 5
Found fresh user data: {id: "abc123", email: "admin@example.com", roles: ["admin"]}
Fresh user roles: ["admin"]
Setting auth data for user: admin@example.com
User roles being set: ["admin"]
Auth data set successfully
Current user roles after set: ["admin"]
User data refreshed successfully with roles: ["admin"]
```

### **Bước 3: Kiểm tra Firebase Auth state change**
Sau đó sẽ thấy:
```
Found matched user in Firestore: {id: "abc123", email: "admin@example.com", roles: ["admin"]}
Matched user roles: ["admin"]
Current user from localStorage: {id: "abc123", email: "admin@example.com", roles: ["admin"]}
Current user roles: ["admin"]
Is data fresh? true
User data is already fresh, skipping refresh
```

## 🚨 **Các lỗi có thể gặp:**

### **Lỗi 1: Không thấy "Scheduling user data refresh"**
**Nguyên nhân:** localStorage không có user data
**Giải pháp:** Login lại

### **Lỗi 2: "Could not find fresh user data in Firestore"**
**Nguyên nhân:** User không tồn tại trong Firestore
**Giải pháp:** Kiểm tra Firestore database

### **Lỗi 3: "Total users loaded from Firestore: 0"**
**Nguyên nhân:** Firestore connection issue
**Giải pháp:** Kiểm tra Firebase config

### **Lỗi 4: "Fresh user roles: []"**
**Nguyên nhân:** User trong Firestore không có roles
**Giải pháp:** Cập nhật user trong Firestore

### **Lỗi 5: "Is data fresh? false"**
**Nguyên nhân:** Logic kiểm tra fresh data có vấn đề
**Giải pháp:** Kiểm tra user data structure

## 🔧 **Debug commands:**

### **Trong Console, gõ:**
```javascript
// Kiểm tra current user state
authService.debugCurrentUserState();

// Force refresh user data
authService.forceRefreshUserData();

// Kiểm tra localStorage
console.log('localStorage user:', JSON.parse(localStorage.getItem('currentUser')));
console.log('localStorage token:', localStorage.getItem('authToken'));
```

## 📋 **Checklist debug:**

- [ ] **Console logs** hiển thị đầy đủ
- [ ] **"Scheduling user data refresh"** xuất hiện
- [ ] **"Starting scheduled user data refresh"** xuất hiện
- [ ] **"Total users loaded from Firestore"** > 0
- [ ] **"Found fresh user data"** xuất hiện
- [ ] **"Fresh user roles"** có đúng roles
- [ ] **"User data refreshed successfully"** xuất hiện
- [ ] **"Is data fresh? true"** xuất hiện

## 🎯 **Nếu vẫn có vấn đề:**

### **1. Kiểm tra Firestore:**
- Vào Firebase Console → Firestore Database
- Kiểm tra collection `users`
- Tìm user với email admin
- Kiểm tra field `roles` có đúng không

### **2. Kiểm tra localStorage:**
- F12 → Application tab → Local Storage
- Kiểm tra `currentUser` và `authToken`
- Xem user data có đúng không

### **3. Kiểm tra Network:**
- F12 → Network tab
- Reload page
- Xem có requests đến Firestore không
- Kiểm tra response data

### **4. Test với user khác:**
- Login với user khác
- Reload page
- Xem có cùng vấn đề không

## 🚀 **Giải pháp tạm thời:**

### **Nếu vẫn không fix được:**
1. **Clear localStorage:**
   ```javascript
   localStorage.clear();
   ```

2. **Login lại:**
   - Logout
   - Login lại với admin account

3. **Force refresh:**
   ```javascript
   authService.forceRefreshUserData();
   ```

## 📞 **Báo cáo lỗi:**

Nếu vẫn có vấn đề, hãy copy và gửi:
1. **Console logs** từ reload page
2. **Screenshot** của Firestore user data
3. **Screenshot** của localStorage
4. **Mô tả** các bước đã thử

**Với thông tin này, tôi sẽ có thể fix vấn đề chính xác!** 🔧
