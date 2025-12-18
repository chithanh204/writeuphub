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

exports.updateUserProfile = async (req, res) => {
  try {
    console.log("CHECK ID:", {
      idFromToken: req.userId,
      idFromURL: req.params.id
    });
    // 1. Bảo mật: Kiểm tra xem người đang request có phải là chủ tài khoản không
    // req.userId lấy từ verifyToken, req.params.id lấy từ URL
    if (req.userId !== req.params.id) {
      return res.status(403).json({ message: "Bạn chỉ có thể cập nhật tài khoản của mình!" });
    }

    // 2. Lọc dữ liệu đầu vào (Chỉ cho phép sửa những trường an toàn)
    const { username, bio, avatar } = req.body;

    // Tạo object chứa thông tin cần update
    const updateData = {};
    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio; // Cho phép xóa bio (gửi string rỗng)
    if (avatar) updateData.avatar = avatar;

    // 3. Cập nhật vào Database
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true } // Trả về data MỚI SAU KHI update thay vì data cũ
    ).select('-password'); // Không trả về mật khẩu

    // 4. Trả kết quả về cho Frontend
    res.status(200).json(updatedUser);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi Server khi cập nhật profile" });
  }
};

// Lấy danh sách tất cả user (Chỉ Admin)
exports.getAllUsers = async (req, res) => {
  try {
    // 1. Kiểm tra xem người gọi có phải Admin không
    const currentUser = await User.findById(req.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: "Bạn không có quyền admin!" });
    }

    // 2. Lấy danh sách user (trừ mật khẩu)
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách user" });
  }
};

// Xóa user (Chỉ Admin)
exports.deleteUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: "Bạn không có quyền admin!" });
    }

    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // Không cho phép tự xóa chính mình
    if (userToDelete._id.toString() === req.userId) {
      return res.status(400).json({ message: "Không thể tự xóa tài khoản admin của mình!" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa user thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa user" });
  }
};