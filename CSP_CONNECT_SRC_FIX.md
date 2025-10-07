# Fix CSP Error: Invalid connect-src directive

## Vấn đề đã phát hiện

**Lỗi CSP trong Console:**
```
The source list for the Content Security Policy directive 'connect-src' contains an invalid source: 'https://us-central1-*.cloudfunctions.net'. It will be ignored.
```

## Nguyên nhân

Cú pháp `https://us-central1-*.cloudfunctions.net` không hợp lệ trong CSP directive `connect-src`. Wildcard `*` không được hỗ trợ trong middle của domain.

## Giải pháp đã áp dụng

### 1. Sửa trong `src/index.html`

**Trước (bị lỗi):**
```html
connect-src 'self' 
  https://*.cloudfunctions.net
  https://us-central1-*.cloudfunctions.net  <!-- ❌ Invalid syntax -->
  https://localhost:7190
  http://localhost:7190;
```

**Sau (đã fix):**
```html
connect-src 'self' 
  https://*.cloudfunctions.net
  https://us-central1-quanlysanxuat.cloudfunctions.net  <!-- ✅ Valid syntax -->
  https://localhost:7190
  http://localhost:7190;
```

### 2. Sửa trong `src/csp-config.js`

**Thêm vào cả development và production CSP:**
```javascript
connect-src 'self' 
  https://www.googleapis.com 
  https://accounts.google.com 
  https://www.gstatic.com 
  https://firebaseapp.com 
  https://*.firebaseapp.com
  https://*.googleapis.com
  https://*.google.com
  https://www.googletagmanager.com
  https://www.google-analytics.com
  https://accounts.google.com/gsi
  https://firestore.googleapis.com
  https://identitytoolkit.googleapis.com
  https://*.cloudfunctions.net
  https://us-central1-quanlysanxuat.cloudfunctions.net  <!-- ✅ Added -->
  https://localhost:7190
  http://localhost:7190;
```

## Các quy tắc CSP connect-src

### ✅ Hợp lệ:
- `https://example.com` - Domain cụ thể
- `https://*.example.com` - Wildcard ở đầu subdomain
- `https://example.com:8080` - Port cụ thể
- `https://*.example.com:8080` - Wildcard subdomain với port

### ❌ Không hợp lệ:
- `https://us-central1-*.cloudfunctions.net` - Wildcard ở giữa domain
- `https://*.*.example.com` - Nhiều wildcard
- `https://example.*.com` - Wildcard ở giữa

## Cách test

### 1. Restart Development Server
```bash
# Dừng server hiện tại
Ctrl + C

# Khởi động lại
npm start
```

### 2. Clear Browser Cache
- Hard refresh: `Ctrl + Shift + R`
- Hoặc clear cache trong Developer Tools

### 3. Kiểm tra Console
- Mở Developer Tools (F12)
- Vào tab Console
- Không còn lỗi CSP về `connect-src`
- Popup gia công có thể mở được

## Kết quả mong đợi

- ✅ Không còn lỗi CSP trong Console
- ✅ Popup "Thao tác quấn dây" mở được bình thường
- ✅ API calls đến Cloud Functions hoạt động
- ✅ Không có warning về CSP

## Lưu ý quan trọng

### Security:
- CSP giúp bảo vệ khỏi XSS attacks
- Chỉ cho phép các domain cần thiết
- Tránh sử dụng `'unsafe-inline'` và `'unsafe-eval'` trong production

### Performance:
- CSP errors có thể làm chậm ứng dụng
- Browser sẽ block resources không được phép
- Cần restart server sau khi thay đổi CSP

## Troubleshooting

Nếu vẫn gặp lỗi CSP:

1. **Kiểm tra cú pháp CSP:**
   - Không có wildcard ở giữa domain
   - Không có space thừa
   - Không có ký tự đặc biệt

2. **Kiểm tra domain:**
   - Đảm bảo domain tồn tại
   - Kiểm tra HTTPS/HTTP
   - Kiểm tra port number

3. **Test từng directive:**
   - Comment out các directive không cần thiết
   - Test từng directive một
   - Thêm lại từng directive

## Liên hệ:
Nếu vẫn gặp vấn đề CSP sau khi áp dụng fix này, hãy:
1. Copy error message từ Console
2. Kiểm tra domain nào bị chặn
3. Thêm domain đó vào CSP directive tương ứng
