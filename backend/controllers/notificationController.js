const Notification = require('../models/Notification');

// Lấy danh sách thông báo của user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .sort({ createdAt: -1 }) // Mới nhất lên đầu
      .populate('sender', 'username avatar') // Lấy thông tin người gửi
      .populate('post', 'title slug'); // Lấy thông tin bài viết liên quan

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi lấy thông báo' });
  }
};