const User = require('../models/User');
const WriteUp = require('../models/WriteUp');

// Lấy thông tin chi tiết Profile theo Username
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Tìm user, loại bỏ password
    const user = await User.findOne({ username }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Đếm số bài viết
    const postCount = await WriteUp.countDocuments({ author: user._id });

    // Trả về info user + số bài viết
    res.json({ ...user._doc, postCount });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật Profile (Avatar, Bio...)
exports.updateUserProfile = async (req, res) => {
  try {
    // Chỉ cho phép update avatar và bio
    const { bio, avatar } = req.body;

    // req.userId lấy từ token
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { bio, avatar },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật' });
  }
}

// Follow hoặc Unfollow một người dùng
exports.toggleFollow = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Lấy ID người đang đăng nhập (từ verifyToken)
    const targetUserId = req.params.id; // Lấy ID người muốn follow (từ URL)

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "Bạn không thể tự theo dõi chính mình!" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra xem đã follow chưa
    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // == UNFOLLOW ==
      // Xóa targetUser khỏi danh sách following của mình
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      // Xóa mình khỏi danh sách followers của họ
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);

      await currentUser.save();
      await targetUser.save();

      return res.status(200).json({ message: "Đã hủy theo dõi", isFollowing: false });
    } else {
      // == FOLLOW ==
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      await currentUser.save();
      await targetUser.save();

      return res.status(200).json({ message: "Đã theo dõi thành công", isFollowing: true });
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};