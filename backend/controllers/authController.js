// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

// Hàm Đăng ký
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin!' });
    }

    // 2. Kiểm tra xem user đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email này đã được sử dụng!' });
    }

    // 3. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Tạo user mới
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công!' });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// Hàm Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng!' });
    }

    // 2. So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng!' });
    }

    // 3. Tạo Token (Vé thông hành)
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Thông tin gói trong token
      process.env.JWT_SECRET,            // Khóa bí mật
      { expiresIn: '1d' }                // Hết hạn sau 1 ngày
    );

    // 4. Trả về kết quả cho client
    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id; // ID của người mình muốn follow
    const currentUser = req.userId;     // ID của mình

    if (targetUserId === currentUser) {
      return res.status(400).json({ message: "Không thể tự follow chính mình" });
    }

    // 1. Cập nhật mảng following/followers (Logic follow cơ bản)
    await User.findByIdAndUpdate(currentUser, { $addToSet: { following: targetUserId } });
    await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUser } });

    // 2. TẠO THÔNG BÁO
    // Kiểm tra xem đã có thông báo follow chưa để tránh spam (Optional)
    const existingNoti = await Notification.findOne({
      recipient: targetUserId,
      sender: currentUser,
      type: 'FOLLOW'
    });

    if (!existingNoti) {
      await Notification.create({
        recipient: targetUserId,
        sender: currentUser,
        type: 'FOLLOW'
      });
    }

    res.json({ message: 'Đã theo dõi thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};