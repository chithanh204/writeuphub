const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Lấy token từ header (Client gửi lên dạng: "Bearer <token>")
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // 2. Nếu không có token -> Chặn luôn
  if (!token) {
    return res.status(401).json({ message: 'Không có quyền truy cập. Vui lòng đăng nhập!' });
  }

  try {
    // 3. Giải mã token để lấy thông tin user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Gán thông tin user vào biến req để các bước sau dùng
    req.userId = decoded.id;

    next(); // Cho phép đi tiếp
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ!' });
  }
};