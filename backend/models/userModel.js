/**
 * User Model
 * Defines the schema for users (customers, providers, and admins)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // [ĐÃ SỬA] Cần import crypto

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please add a full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: ['customer', 'provider', 'admin'],
      default: 'customer',
    },
    avatarUrl: {
      type: String,
      // [ĐÃ SỬA] Xóa default, để logic tạo avatar xử lý trong controller
    },
    status: {
      type: String,
      enum: ['active', 'pending_provider', 'inactive'],
      default: 'active',
    },
    // [ĐÃ SỬA] Thêm các trường cho Reset Password
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date, 
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  // Tự động tạo avatarUrl khi chưa có
  if (!this.avatarUrl) {
    const name = this.fullName ? encodeURIComponent(this.fullName) : 'User';
    
    this.avatarUrl = `https://ui-avatars.com/api/?name=${name}&background=random`;
  }

  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    next();
  }

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// [ĐÃ SỬA] Phương thức tạo Reset Token
userSchema.methods.createPasswordChangedToken = function() {
    // 1. Tạo token ngẫu nhiên (sẽ gửi đi qua email)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2. Băm token (LƯU VÀO DB để so sánh)
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // 3. Đặt thời gian hết hạn (15 phút)
    this.passwordResetExpires = Date.now() + 15 * 60 * 1000; 

    // Trả về token KHÔNG BĂM (sẽ gửi qua email)
    return resetToken;
};


// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;