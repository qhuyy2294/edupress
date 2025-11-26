const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const sendMail = require('../ultils/sendMail');
// [ĐÃ SỬA] Xóa import này nếu bạn không dùng các hàm đó. Nếu dùng thì phải tạo file /middlewares/jwt.js
// const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt');
const crypto = require('crypto');

/**
* Tạo mã thông báo JWT
* @param {string} id - ID người dùng
* @returns {string} mã thông báo JWT
*/
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

/**
* @desc Đăng ký người dùng mới
* @route POST /api/auth/register
* @access Public
*/
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  // Validate input
  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Kiểm tra xem người dùng đã tồn tại chưa
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Tạo người dùng (mật khẩu sẽ được băm bằng phần mềm trung gian trước khi lưu)
  const user = await User.create({
    fullName,
    email,
    password,
    role: 'customer', // Vai trò mặc định
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        status: user.status,
        token: generateToken(user._id),
      },
      message: 'User registered successfully',
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
* @desc Xác thực người dùng và nhận mã thông báo
* @route POST /api/auth/login
* @access Public
*/
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

 // Xác thực đầu vào
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }
// Kiểm tra người dùng (bao gồm mật khẩu để so sánh)
  const user = await User.findOne({ email }).select('+password'); //

  if (user && (await user.matchPassword(password))) {
// Kiểm tra xem tài khoản có hoạt động không
    if (user.status === 'inactive') {
      res.status(403);
      throw new Error('Account is inactive. Please contact support.');
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        status: user.status,
        token: generateToken(user._id),
      },
      message: 'Login successful',
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
* @desc Lấy thông tin người dùng hiện đang đăng nhập
* @route GET /api/auth/me
* @access Private
*/
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      status: user.status,
      createdAt: user.createdAt,
    },
  });
});

/**
* @desc Cập nhật hồ sơ người dùng
* @route PUT /api/auth/profile
* @access Private
*/
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.avatarUrl = req.body.avatarUrl || user.avatarUrl;

// Chỉ cập nhật email nếu được cung cấp và khác
    if (req.body.email && req.body.email !== user.email) {
// Kiểm tra xem email mới đã tồn tại chưa
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email đã được sử dụng');
      }
      user.email = req.body.email;
    }

// Cập nhật mật khẩu nếu được cung cấp
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        status: updatedUser.status,
      },
      message: 'Profile updated successfully',
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


/**
* @desc Yêu cầu đặt lại mật khẩu (Gửi email)
* @route POST /api/auth/forgot-password
* @access Public
*/
const forgotPassword = asyncHandler(async (req, res) => {
    // [ĐÃ SỬA] Lấy email từ body vì đây là POST request
    const { email } = req.body 
    
    if (!email) {
        res.status(400);
        throw new Error('Missing email');
    }

    const user = await User.findOne({ email });
    
    // [ĐÃ SỬA] Không thông báo lỗi 'User not found' để tránh rò rỉ thông tin người dùng.
    if (!user) {
        return res.status(200).json({
            success: true,
            message: 'Nếu email này tồn tại, liên kết đặt lại mật khẩu đã được gửi.'
        });
    }

    const resetToken = user.createPasswordChangedToken()
    // Lưu token đã băm vào DB (Không cần validate)
    await user.save({ validateBeforeSave: false }) 

    // [ĐÃ SỬA] Sử dụng CLIENT_URL cho link frontend
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn. Link này sẽ hết hạn sau 15 phút kể từ bây giờ. <a href="${resetUrl}">Click here</a>`

    const data = {
        email: user.email, // [ĐÃ SỬA] Dùng user.email
        subject: 'Edupress - Yêu cầu Đặt lại Mật khẩu', // [BỔ SUNG] Thêm subject
        html
    }
    
    try {
        const rs = await sendMail(data);
        return res.status(200).json({
            success: true,
            message: 'Liên kết đặt lại mật khẩu đã được gửi.', // [ĐÃ SỬA] Message rõ ràng hơn
            rs
        });
    } catch (error) {
        // Nếu gửi mail thất bại, xóa token đã lưu
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500);
        throw new Error('Lỗi khi gửi email. Vui lòng thử lại sau.');
    }
})

/**
* @desc Đặt lại mật khẩu (Nhận token và mật khẩu mới)
* @route PUT /api/auth/reset-password/:token
* @access Public
*/
const resetPassword = asyncHandler(async (req, res) => {
    // [ĐÃ SỬA] Lấy token từ URL params
    const token = req.params.token; 
    const { password } = req.body;
    
    if (!password || !token) { // [ĐÃ SỬA] Kiểm tra token và password
        res.status(400);
        throw new Error('Missing new password or reset token');
    }

    // Băm token nhận được từ client để so sánh với DB
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
    
    // Tìm người dùng với token đã băm VÀ token chưa hết hạn
    const user = await User.findOne({ 
        passwordResetToken, 
        passwordResetExpires: { $gt: Date.now() } 
    }).select('+password');

    if (!user) {
        res.status(400);
        throw new Error('Token không hợp lệ hoặc đã hết hạn.');
    }

    // Cập nhật mật khẩu mới (sẽ được băm qua middleware 'pre-save')
    user.password = password
    
    // Xóa các trường token
    user.passwordResetToken = undefined
    user.passwordChangedAt = Date.now()
    user.passwordResetExpires = undefined

    await user.save()
    
    return res.status(200).json({
        success: true,
        mes: 'Mật khẩu đã được cập nhật thành công.'
    })
})

/**
 * @desc Lấy danh sách tất cả người dùng (Admin)
 * @route GET /api/auth/users
 * @access Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
    const response = await User.find().select('-refreshToken -password -role')
    return res.status(200).json({
        success: response ? true : false,
        users: response
    })
})

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  getUsers, // [ĐÃ SỬA] Bổ sung getUsers vào export list
};