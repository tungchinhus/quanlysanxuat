# Quản Lý Sản Xuất - Frontend

Ứng dụng web quản lý sản xuất được xây dựng bằng Angular 20, cung cấp giao diện hiện đại và thân thiện với người dùng cho việc quản lý hoạt động sản xuất trong nhà máy.

## 🚀 Tính năng chính

### 📊 Dashboard
- Tổng quan về tình hình sản xuất
- Thống kê sản phẩm sản xuất theo ngày
- Tình trạng dây chuyền sản xuất
- Hoạt động gần đây

### ⚙️ Quản Lý Sản Xuất
- Quản lý lô sản xuất
- Theo dõi trạng thái dây chuyền
- Cảnh báo và thông báo
- Báo cáo sản xuất

### 📦 Quản Lý Kho
- Quản lý tồn kho sản phẩm
- Cảnh báo sắp hết hàng
- Tìm kiếm và lọc sản phẩm
- Báo cáo tồn kho

### ✅ Kiểm Soát Chất Lượng
- Quản lý tiêu chuẩn chất lượng
- Lịch sử kiểm tra
- Báo cáo chất lượng
- Cảnh báo chất lượng

## 🛠️ Công nghệ sử dụng

- **Angular 20** - Framework chính
- **TypeScript** - Ngôn ngữ lập trình
- **SCSS** - CSS preprocessor
- **Font Awesome** - Icon library
- **Angular Material** - UI components
- **Chart.js** - Biểu đồ và thống kê

## 📋 Yêu cầu hệ thống

- Node.js v16.10.0 hoặc cao hơn
- npm hoặc yarn
- Angular CLI

## 🚀 Cài đặt và chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd quanlysxFE
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Chạy ứng dụng
```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:4200`

### 4. Build cho production
```bash
npm run build
```

## 📁 Cấu trúc thư mục

```
src/
├── app/
│   ├── core/                    # Core modules
│   │   ├── layout/             # Layout components
│   │   │   ├── header/         # Header component
│   │   │   └── sidebar/        # Sidebar component
│   │   └── services/           # Core services
│   ├── features/               # Feature modules
│   │   ├── dashboard/          # Dashboard
│   │   ├── production-management/  # Quản lý sản xuất
│   │   ├── inventory-management/   # Quản lý kho
│   │   └── quality-control/    # Kiểm soát chất lượng
│   ├── shared/                 # Shared components
│   ├── app.component.ts        # Root component
│   ├── app.routes.ts          # Routing configuration
│   └── app.config.ts          # App configuration
├── styles.scss                 # Global styles
└── index.html                 # Main HTML file
```

## 🎨 Giao diện

Ứng dụng được thiết kế với giao diện hiện đại, responsive và thân thiện với người dùng:

- **Header**: Logo, tìm kiếm, thông báo, menu người dùng
- **Sidebar**: Navigation menu với các module chính
- **Main Content**: Nội dung chính của từng trang
- **Cards**: Hiển thị thông tin dạng card
- **Tables**: Bảng dữ liệu với tính năng tìm kiếm và lọc
- **Charts**: Biểu đồ thống kê trực quan

## 🔧 Cấu hình

### Routing
Các route được cấu hình trong `app.routes.ts`:
- `/` - Redirect to dashboard
- `/dashboard` - Trang chủ
- `/production` - Quản lý sản xuất
- `/inventory` - Quản lý kho
- `/quality` - Kiểm soát chất lượng

### Styling
- Sử dụng SCSS cho styling
- Responsive design cho mobile và desktop
- Color scheme chuyên nghiệp
- Font Awesome icons

## 📱 Responsive Design

Ứng dụng được thiết kế responsive, hoạt động tốt trên:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🚀 Deployment

### Firebase Hosting
```bash
ng build --prod
firebase deploy
```

### Nginx
```bash
ng build --prod
# Copy dist/ folder to nginx web root
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- Email: admin@example.com
- Project Link: [https://github.com/username/quanlysxFE](https://github.com/username/quanlysxFE)

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Font Awesome for the icons
- Chart.js for the charting library
- All contributors who helped build this project