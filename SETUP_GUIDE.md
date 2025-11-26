# Edupress - Hướng dẫn Khởi động Nhanh

## 🎯 Hướng dẫn Cài đặt Đầy đủ

### Bước 1: Thiết lập Backend

1. **Mở terminal và điều hướng đến thư mục backend:**
```bash
cd backend
```

2. **Cài đặt tất cả các gói phụ thuộc:**
```bash
npm install
```

3. **Kiểm tra cấu hình tệp .env:**
Đảm bảo tệp `.env` của bạn chứa:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edupress
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

4. **Khởi động MongoDB:**
- **Windows:** Mở Command Prompt với tư cách Quản trị viên
```bash
net start MongoDB
```
- **macOS/Linux:**
```bash
sudo systemctl start mongod
```

5. **Khởi động máy chủ backend:**
```bash
npm run dev
```

Bạn sẽ thấy:
```
✅ MongoDB Connected: localhost
🚀 Máy chủ đang chạy ở chế độ phát triển trên cổng 5000
```

### Bước 2: Thiết lập giao diện người dùng

1. **Mở một terminal MỚI và điều hướng đến thư mục client:**
```bash
cd client
```

2. **Cài đặt tất cả các dependency:**
```bash
npm install
```

3. **Khởi động ứng dụng React:**
```bash
npm start
```

Ứng dụng sẽ tự động mở trong trình duyệt của bạn tại `http://localhost:3000`

### Bước 3: Tạo Người dùng Quản trị

Vì ứng dụng không cho phép đăng ký quản trị thông qua UI, bạn cần tạo thủ công người dùng quản trị trong MongoDB.

**Tùy chọn 1: Sử dụng MongoDB Compass (GUI)**
1. Mở MongoDB Compass
2. Kết nối với `mongodb://localhost:27017`
3. Chọn cơ sở dữ liệu `edupress`
4. Chọn bộ sưu tập `users`
5. Nhấp vào "THÊM DỮ LIỆU" → "Chèn Tài liệu"
6. Dán JSON này (thay thế băm mật khẩu):

```json
{
"fullName": "Người dùng Quản trị",
"email": "admin@edupress.com",
"password": "$2a$10$5vZ8qYx1qQx9xX9x9X9x9.x9x9x9x9x9x9x9x9x9x9x9x9x9x9x9x",
"role": "admin",
"status": "active",
"avatarUrl": "default_avatar.png",
"createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
"updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
}
```

**Tùy chọn 2: Sử dụng MongoDB Shell**
```bash
mongosh
use edupress
db.users.insertOne({
fullName: "Người dùng quản trị",
email: "admin@edupress.com",
password: "$2a$10$5vZ8qYx1qQx9xX9x9X9x9.x9x9x9x9x9x9x9x9x9x9x9x9x9x9x9x",
vai trò: "admin",
trạng thái: "đang hoạt động",
avatarUrl: "default_avatar.png",
createAt: new Date(),
updateAt: new Date()
})
```

**Để tạo mã băm mật khẩu phù hợp:**
1. Trong thư mục backend, hãy tạo tệp `hashPassword.js`:
```javascript
const bcrypt = require('bcryptjs');

async function hashPassword() {
const password = 'admin123'; // Thay đổi thành mật khẩu mong muốn của bạn
const salt = await bcrypt.genSalt(10);
const hashed = await bcrypt.hash(password, salt);
console.log('Mật khẩu đã băm:', đã băm);
}

hashPassword();
```

2. Chạy tệp:
```bash
node hashPassword.js
```

3. Sao chép mật khẩu đã băm và sử dụng nó trong lệnh chèn MongoDB ở trên.

### Bước 4: Kiểm tra Ứng dụng

1. **Đăng ký người dùng thông thường:**
- Truy cập `http://localhost:3000/register`
- Tạo tài khoản khách hàng
- Email: `user@test.com`
- Mật khẩu: `password123`

2. **Đăng nhập với tư cách quản trị viên:**
- Truy cập `http://localhost:3000/login`
- Email: `admin@edupress.com`
- Mật khẩu: `admin123` (hoặc bất kỳ mật khẩu nào bạn đặt)
- Bạn sẽ thấy "Bảng điều khiển quản trị viên" trong thanh điều hướng

3. **Yêu cầu trở thành nhà cung cấp:**
- Đăng nhập với tư cách khách hàng
- Truy cập "Trở thành nhà cung cấp"
- Gửi yêu cầu
- Đăng nhập với tư cách quản trị viên để phê duyệt yêu cầu

4. **Tạo khóa học:**
- Đăng nhập với tư cách nhà cung cấp đã được phê duyệt
- Truy cập "Tạo khóa học"
- Điền thông tin khóa học
- Đăng nhập với tư cách quản trị viên để phê duyệt khóa học

## 🔧 Khắc phục sự cố

### Kết nối MongoDB Lỗi
**Vấn đề:** Không thể kết nối với MongoDB
**Giải pháp:**
- Đảm bảo MongoDB đang chạy
- Kiểm tra xem chuỗi kết nối trong `.env` có đúng không
- Thử kết nối với MongoDB Compass để xác minh

### Cổng đã được sử dụng
**Vấn đề:** Cổng 5000 hoặc 3000 đã được sử dụng
**Giải pháp:**
```bash
# Windows - Tắt tiến trình trên cổng 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux - Tắt tiến trình trên cổng 5000
lsof -ti:5000 | xargs kill -9
```

### Lỗi CORS
**Vấn đề:** Chính sách CORS chặn yêu cầu
**Giải pháp:**
- Đảm bảo backend đang chạy trên cổng 5000
- Kiểm tra `CLIENT_URL` trong tệp `.env` của backend
- Khởi động lại cả backend và frontend

### Sự cố mã thông báo JWT
**Vấn đề:** Lỗi "Không được ủy quyền"
**Giải pháp:**
- Xóa localStorage của trình duyệt
- Đăng nhập lại
- Kiểm tra xem JWT_SECRET đã được đặt trong `.env` chưa

## 📝 Tài khoản kiểm tra mặc định

Sau khi thiết lập, bạn sẽ có:

**Tài khoản quản trị:**
- Email: `admin@edupress.com`
- Mật khẩu: `admin123` (hoặc mật khẩu tùy chỉnh của bạn)
- Vai trò: Quản trị viên

**Tài khoản khách hàng** (do bạn tạo):
- Email: `user@test.com`
- Mật khẩu: `password123`
- Vai trò: Khách hàng

## 🎨 Các tập lệnh khả dụng

### Backend
- `npm start` - Khởi động máy chủ sản xuất
- `npm run dev` - Khởi động máy chủ phát triển với nodemon

### Frontend
- `npm start` - Khởi động máy chủ phát triển
- `npm run build` - Xây dựng cho sản xuất
- `npm test` - Chạy thử nghiệm

## 📚 Các bước tiếp theo

1. ✅ Tạo một số khóa học mẫu
2. ✅ Kiểm tra quy trình đăng ký
3. ✅ Khám phá quản trị
4. ✅ Tùy chỉnh giao diện người dùng
5. ✅ Thêm các tính năng khác khi cần thiết

## 🆘 Cần trợ giúp?

Nếu bạn gặp bất kỳ sự cố nào:
1. Kiểm tra nhật ký bảng điều khiển (cả backend và frontend)
2. Xác minh tất cả các phụ thuộc đã được cài đặt
3. Đảm bảo MongoDB đang chạy
4. Kiểm tra các biến môi trường đã được thiết lập chính xác

---

**Xin chúc mừng! Nền tảng Edupress của bạn đã sẵn sàng! 🎉**