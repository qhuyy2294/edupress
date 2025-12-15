# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN EDUPRESS

## ✅ Yêu cầu hệ thống

- **Node.js**: v14 trở lên (khuyến nghị v18+)
- **MongoDB**: v4.4 trở lên
- **npm** hoặc **yarn**
- **Git**

---

## 📋 BƯỚC 1: CÀI ĐẶT MONGODB

### Cách 1: MongoDB Community Server (Local)

1. **Download MongoDB**:
   - Truy cập: https://www.mongodb.com/try/download/community
   - Chọn phiên bản Windows
   - Download và cài đặt

2. **Cài đặt**:
   - Chạy file .msi vừa tải
   - Chọn "Complete" installation
   - Tick "Install MongoDB as a Service"
   - Để mặc định port 27017

3. **Kiểm tra MongoDB đang chạy**:
   ```cmd
   mongosh
   ```
   Nếu kết nối thành công → MongoDB đã sẵn sàng!

### Cách 2: MongoDB Atlas (Cloud - Miễn phí)

1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Tạo tài khoản miễn phí
3. Tạo cluster (chọn FREE tier)
4. Lấy Connection String
5. Thay đổi `MONGODB_URI` trong file `.env`

---

## 📋 BƯỚC 2: CÀI ĐẶT DEPENDENCIES

### Backend:
```cmd
cd backend
npm install
```

### Frontend:
```cmd
cd client
npm install
```

✅ **ĐÃ HOÀN THÀNH** - Dependencies đã được cài đặt!

---

## 📋 BƯỚC 3: CẤU HÌNH ENVIRONMENT

File `.env` đã được tạo tại `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edupress
JWT_SECRET=edupress_secret_key_2025_secure_token
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### ⚠️ QUAN TRỌNG - Cấu hình Email:

Để tính năng quên mật khẩu hoạt động, bạn cần:

1. **Thay đổi `EMAIL_USER`**: Địa chỉ Gmail của bạn
2. **Lấy App Password**:
   - Truy cập: https://myaccount.google.com/security
   - Bật **2-Step Verification**
   - Vào **App passwords**: https://myaccount.google.com/apppasswords
   - Chọn "Mail" → "Windows Computer"
   - Copy mật khẩu 16 ký tự → Dán vào `EMAIL_PASS`

**Lưu ý**: Không dùng mật khẩu Gmail thông thường, phải dùng App Password!

---

## 📋 BƯỚC 4: SEED DATABASE (Tùy chọn)

Để có dữ liệu mẫu ban đầu:

```cmd
cd backend
node seed.js
```

Lệnh này sẽ tạo:
- 1 Admin account
- 5 Providers
- 10 Customers
- 20 Courses với lessons
- Sample enrollments và reviews

**Thông tin đăng nhập mẫu**:
- **Admin**: admin@edupress.com / password123
- **Provider**: provider1@edupress.com / password123
- **Customer**: customer1@edupress.com / password123

---

## 📋 BƯỚC 5: CHẠY DỰ ÁN

### Cách 1: Chạy Backend và Frontend riêng biệt

**Terminal 1 - Backend**:
```cmd
cd backend
npm start
```
→ Backend chạy tại: http://localhost:5000

**Terminal 2 - Frontend**:
```cmd
cd client
npm start
```
→ Frontend tự động mở tại: http://localhost:3000

### Cách 2: Chạy từ thư mục gốc (nếu có script)

```cmd
npm run dev
```

---

## 🎉 BƯỚC 6: TRUY CẬP ỨNG DỤNG

Mở trình duyệt và truy cập:
```
http://localhost:3000
```

### Thử nghiệm hệ thống:

1. **Đăng ký tài khoản mới** → Role mặc định là Customer
2. **Đăng nhập với tài khoản mẫu** (nếu đã seed):
   - Admin: admin@edupress.com / password123
   - Provider: provider1@edupress.com / password123
   - Customer: customer1@edupress.com / password123

3. **Các tính năng chính**:
   - 👤 Customer: Xem khóa học, đăng ký, học bài, đánh giá
   - 👨‍🏫 Provider: Tạo khóa học, quản lý lessons, tạo discount
   - 🔧 Admin: Duyệt courses, quản lý users, xem thống kê

---

## 🛠️ TROUBLESHOOTING

### Lỗi: MongoDB connection failed

**Nguyên nhân**: MongoDB chưa chạy

**Giải pháp**:
```cmd
# Khởi động MongoDB service
net start MongoDB
```

Hoặc mở **Services** (services.msc) → Tìm "MongoDB" → Start

---

### Lỗi: Port 5000 already in use

**Giải pháp 1**: Thay đổi port trong `.env`:
```env
PORT=5001
```

**Giải pháp 2**: Dừng process đang dùng port 5000:
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

---

### Lỗi: CORS blocked

**Nguyên nhân**: Frontend chạy không đúng port hoặc CLIENT_URL sai

**Giải pháp**: Kiểm tra `backend/.env`:
```env
CLIENT_URL=http://localhost:3000
```

---

### Lỗi: Email không gửi được

**Kiểm tra**:
1. `EMAIL_USER` là Gmail hợp lệ
2. `EMAIL_PASS` là App Password (16 ký tự), không phải mật khẩu thường
3. Đã bật 2-Step Verification trên Gmail

---

## 📚 CẤU TRÚC API ENDPOINTS

### Auth Routes
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password/:token` - Reset mật khẩu
- `PUT /api/auth/profile` - Cập nhật profile

### Course Routes
- `GET /api/courses` - Danh sách khóa học (public)
- `GET /api/courses/:id` - Chi tiết khóa học
- `POST /api/courses` - Tạo khóa học (Provider)
- `PUT /api/courses/:id` - Cập nhật khóa học
- `DELETE /api/courses/:id` - Xóa khóa học
- `POST /api/courses/:id/enroll` - Đăng ký khóa học

### Admin Routes
- `GET /api/admin/users` - Danh sách users
- `GET /api/admin/stats` - Thống kê hệ thống
- `PUT /api/admin/courses/:id/approve` - Duyệt khóa học
- `PUT /api/admin/providers/:id/approve` - Duyệt provider

*Xem đầy đủ API tại các file trong `backend/routes/`*

---

## 🎯 LƯU Ý QUAN TRỌNG

1. **MongoDB phải chạy** trước khi start backend
2. **Backend phải chạy** trước khi start frontend
3. **Email config** chỉ cần thiết nếu dùng tính năng quên mật khẩu
4. **Seed data** là tùy chọn, có thể đăng ký tài khoản mới thủ công

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra console logs của Backend và Frontend
2. Xem MongoDB logs: `C:\Program Files\MongoDB\Server\<version>\log\mongod.log`
3. Đảm bảo tất cả dependencies đã cài đặt đầy đủ

---

## 🎊 CHÚC BẠN THÀNH CÔNG!

Sau khi hoàn tất các bước trên, bạn đã có một hệ thống EduPress đầy đủ tính năng!

**Tiếp theo có thể làm**:
- Deploy lên Heroku/Vercel/Railway
- Thêm payment gateway (Stripe/PayPal)
- Tích hợp video upload (Cloudinary/AWS S3)
- Thêm real-time chat (Socket.io)
