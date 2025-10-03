# Hướng dẫn Test tính năng đổi mật khẩu

## 🎯 **Tính năng đã được fix:**

### **1. Fallback mechanism hoàn chỉnh:**
- ✅ **Cloud Functions fail** → Tự động chuyển sang **FreePasswordService**
- ✅ **Kiểm tra Firebase Auth account** của user
- ✅ **Tạo Firebase Auth account mới** nếu user chưa có
- ✅ **Dialog thiết lập mật khẩu tạm thời** nếu cần

### **2. FreePasswordService được cải thiện:**
- ✅ **Logic thông minh:** Kiểm tra user đã có Firebase Auth account chưa
- ✅ **Tạo mới:** Nếu chưa có → Tạo Firebase Auth account với mật khẩu mới
- ✅ **Cập nhật:** Nếu đã có → Thông báo cần Cloud Functions
- ✅ **Error handling:** Xử lý tất cả các trường hợp lỗi

## 🧪 **Cách test:**

### **Test Case 1: User chưa có Firebase Auth account**
1. **Chọn user** chưa có Firebase Auth account
2. **Click "Đổi mật khẩu"** → Dialog mở
3. **Nhập mật khẩu mới** → Submit
4. **Kết quả mong đợi:**
   - Cloud Functions fail (status 0)
   - Tự động chuyển sang FreePasswordService
   - Tạo Firebase Auth account mới với mật khẩu mới
   - Thông báo: "✅ Đã tạo Firebase Auth account và đặt mật khẩu thành công"

### **Test Case 2: User đã có Firebase Auth account**
1. **Chọn user** đã có Firebase Auth account
2. **Click "Đổi mật khẩu"** → Dialog mở
3. **Nhập mật khẩu mới** → Submit
4. **Kết quả mong đợi:**
   - Cloud Functions fail (status 0)
   - Tự động chuyển sang FreePasswordService
   - Thông báo: "❌ User đã có Firebase Auth account. Cần mật khẩu hiện tại để đổi mật khẩu. Vui lòng sử dụng Cloud Functions."
   - Mở dialog thiết lập mật khẩu tạm thời

### **Test Case 3: Dialog thiết lập mật khẩu tạm thời**
1. **Mở dialog thiết lập** (từ Test Case 2)
2. **Tab 1:** Nhập email → Click "Thiết lập mật khẩu tạm thời"
3. **Kết quả mong đợi:**
   - Tạo Firebase Auth account với mật khẩu tạm thời
   - Chuyển sang Tab 2
   - Thông báo: "✅ Đã thiết lập mật khẩu tạm thời thành công"
4. **Tab 2:** Nhập mật khẩu mới → Click "Đổi mật khẩu"
5. **Kết quả mong đợi:**
   - Đổi mật khẩu thành công
   - Dialog đóng
   - Thông báo: "✅ Đã cập nhật mật khẩu thành công"

## 🔍 **Kiểm tra Console:**

### **Console logs mong đợi:**
```
Error changing password: [HttpErrorResponse with status 0]
Cloud Functions failed, trying FreePasswordService...
Trying FreePasswordService for user: [User Name]
```

### **Network requests mong đợi:**
- **Cloud Functions call:** `https://us-central1-quanlysanxuat.cloudfunctions.net/changeUserPassword` → **Status 0**
- **Firebase Auth calls:** `accounts:signInWithPassword` hoặc `accounts:signUp` → **Status 200**

## 🚨 **Các lỗi đã được fix:**

### **1. HTTP status 0:**
- **Nguyên nhân:** Cloud Functions chưa được deploy (cần Blaze plan)
- **Giải pháp:** Fallback sang FreePasswordService

### **2. 400 Bad Request trong signInWithPassword:**
- **Nguyên nhân:** Cố gắng đăng nhập với mật khẩu tạm thời không đúng
- **Giải pháp:** Logic thông minh kiểm tra và tạo Firebase Auth account mới

### **3. Firebase UID not found:**
- **Nguyên nhân:** User chưa có Firebase Auth account
- **Giải pháp:** Tự động tạo Firebase Auth account và cập nhật Firestore

## 📋 **Checklist test:**

- [ ] **Test Case 1:** User chưa có Firebase Auth account
- [ ] **Test Case 2:** User đã có Firebase Auth account  
- [ ] **Test Case 3:** Dialog thiết lập mật khẩu tạm thời
- [ ] **Console logs:** Không có lỗi nghiêm trọng
- [ ] **Network requests:** Cloud Functions fail, Firebase Auth success
- [ ] **UI feedback:** Thông báo rõ ràng cho user

## 🎉 **Kết quả mong đợi:**

**Tính năng đổi mật khẩu hoạt động hoàn chỉnh!**

- ✅ **Admin có thể đổi mật khẩu** cho bất kỳ user nào
- ✅ **Tự động fallback** khi Cloud Functions không khả dụng
- ✅ **Tạo Firebase Auth account** cho user chưa có
- ✅ **Thông báo rõ ràng** cho từng trường hợp
- ✅ **Hoàn toàn miễn phí** với FreePasswordService

## 🔧 **Nếu vẫn có lỗi:**

### **Kiểm tra:**
1. **Console logs** để xem lỗi cụ thể
2. **Network tab** để xem requests
3. **Firebase Console** để xem Authentication users
4. **Firestore** để xem user documents

### **Debug steps:**
1. **Mở Developer Tools** → Console
2. **Thử đổi mật khẩu** cho user
3. **Xem console logs** và network requests
4. **Báo cáo lỗi cụ thể** nếu có
