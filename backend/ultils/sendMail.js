// backend/ultils/sendMail.js

const nodemailer = require('nodemailer');

// Hàm sendMail nhận vào đối tượng data chứa email, subject, và html content
const sendMail = async (data) => {
    // 1. Cấu hình Transporter
    // Lưu ý: Cổng (port) và bảo mật (secure) thường được quyết định bởi service
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, // PHẢI LÀ MẬT KHẨU ỨNG DỤNG (APP PASSWORD)
        },
    });

    // 2. Định nghĩa nội dung email
    let mailOptions = {
        from: process.env.EMAIL_USER, // Địa chỉ gửi đi
        to: data.email,              // Địa chỉ nhận
        subject: data.subject || 'Thông báo từ Edupress', // Tiêu đề mặc định
        html: data.html,             // Nội dung HTML
    };

    try {
        // 3. Gửi email
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        // Lỗi 535-5.7.8 sẽ được in ra ở đây
        console.error("Lỗi Nodemailer khi gửi email:", error);
        // Ném lỗi để Auth Controller có thể bắt và xử lý
        throw new Error('Không thể gửi email: ' + error.message); 
    }
};

// Export hàm sendMail
module.exports = sendMail;