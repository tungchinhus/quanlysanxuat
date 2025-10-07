# CSP (Content Security Policy) Troubleshooting Guide

## Vấn đề CSP đã được phát hiện và khắc phục

### Lỗi CSP phổ biến:
- **"Content Security Policy of your site blocks some resources"**
- **"Refused to connect to..."**
- **"Refused to load the script because it violates the following Content Security Policy directive"**

## Nguyên nhân chính:
1. **Thiếu domain trong CSP directives**
2. **WebSocket connections không được phép**
3. **CDN resources bị chặn**
4. **Firebase Cloud Functions không được phép**

## Giải pháp đã áp dụng:

### 1. Cập nhật CSP trong `src/index.html`

#### Script Sources:
```html
script-src 'self' 'unsafe-inline' 'unsafe-eval' 
  https://apis.google.com 
  https://www.gstatic.com 
  https://accounts.google.com 
  https://www.googleapis.com 
  https://www.googletagmanager.com
  https://*.googleapis.com
  https://cdnjs.cloudflare.com
  https://unpkg.com
  blob: data:;
```

#### Connect Sources (API calls):
```html
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
  https://us-central1-*.cloudfunctions.net
  https://localhost:7190
  http://localhost:7190
  ws://localhost:* 
  http://localhost:*;
```

### 2. Các directive quan trọng:

- **`script-src`**: Cho phép load JavaScript từ các domain
- **`connect-src`**: Cho phép API calls và WebSocket connections
- **`style-src`**: Cho phép load CSS
- **`font-src`**: Cho phép load fonts
- **`img-src`**: Cho phép load images
- **`frame-src`**: Cho phép load iframes

## Cách debug CSP errors:

### 1. Mở Developer Tools (F12)
- Vào tab **Console**
- Tìm các lỗi có chứa "Content Security Policy"
- Ghi lại domain nào bị chặn

### 2. Mở tab **Issues**
- Xem chi tiết lỗi CSP
- Kiểm tra resource nào bị block

### 3. Thêm domain vào CSP:
```html
<!-- Ví dụ: nếu cần thêm domain mới -->
connect-src 'self' 
  https://your-new-domain.com
  https://api.your-service.com;
```

## Các domain quan trọng đã được thêm:

### Firebase & Google Services:
- `https://*.googleapis.com`
- `https://firestore.googleapis.com`
- `https://identitytoolkit.googleapis.com`
- `https://*.cloudfunctions.net`
- `https://us-central1-*.cloudfunctions.net`

### Development:
- `https://localhost:7190`
- `http://localhost:7190`
- `ws://localhost:*`
- `http://localhost:*`

### CDN & External Resources:
- `https://cdnjs.cloudflare.com`
- `https://unpkg.com`

## Cách test sau khi fix:

### 1. Restart Development Server:
```bash
# Dừng server hiện tại
Ctrl + C

# Khởi động lại
npm start
```

### 2. Clear Browser Cache:
- Hard refresh: `Ctrl + Shift + R`
- Hoặc clear cache trong Developer Tools

### 3. Kiểm tra Console:
- Không còn lỗi CSP
- Popup mở được bình thường
- API calls hoạt động

## Lưu ý quan trọng:

### Security:
- CSP giúp bảo vệ ứng dụng khỏi XSS attacks
- Không nên sử dụng `'unsafe-inline'` và `'unsafe-eval'` trong production
- Chỉ cho phép các domain cần thiết

### Performance:
- CSP errors có thể làm chậm ứng dụng
- Browser sẽ block resources không được phép
- Cần restart server sau khi thay đổi CSP

## Troubleshooting Checklist:

- [ ] Restart development server
- [ ] Clear browser cache
- [ ] Check Developer Tools Console
- [ ] Check Developer Tools Issues tab
- [ ] Verify all required domains are in CSP
- [ ] Test popup functionality
- [ ] Test API calls
- [ ] Test WebSocket connections (nếu có)

## Liên hệ:
Nếu vẫn gặp lỗi CSP sau khi áp dụng các fix trên, hãy:
1. Copy error message từ Console
2. Kiểm tra domain nào bị chặn
3. Thêm domain đó vào CSP directive tương ứng
