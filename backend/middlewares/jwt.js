// backend/middlewares/jwt.js

const jwt = require('jsonwebtoken');

/**
 * @desc Tạo Access Token
 * @param {string} userId - ID người dùng
 * @returns {string} Access Token
 */
const generateAccessToken = (userId) => {
    // Chúng ta không sử dụng hàm này trong authController.js nữa vì đã có generateToken riêng,
    // nhưng cần phải định nghĩa nó để tránh lỗi import.
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d', // Thường dùng cho Access Token
    });
};

/**
 * @desc Tạo Refresh Token
 * @param {string} userId - ID người dùng
 * @returns {string} Refresh Token
 */
const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Thường dùng cho Refresh Token
    });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
};