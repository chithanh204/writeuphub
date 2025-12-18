const WriteUp = require('../models/WriteUp');
const User = require('../models/User');
const slugify = require('slugify');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// ==============================================
// 1. CÁC CHỨC NĂNG CƠ BẢN (CRUD)
// ==============================================
exports.createWriteUp = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!title || !content) {
      return res.status(400).json({ message: 'Tiêu đề và nội dung là bắt buộc' });
    }

    // 2. LẤY ID USER AN TOÀN (Sửa đoạn này)
    // Kiểm tra xem middleware lưu user vào đâu (req.user.id, req.user._id hay req.userId)
    const authorId = req.user?.id || req.userId || req.user?._id;

    if (!authorId) {
      return res.status(401).json({ message: "Không xác thực được danh tính người đăng (Token lỗi)." });
    }

    // 3. Xử lý Tags
    let tagsArray = [];
    if (typeof tags === 'string') {
      tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    } else if (Array.isArray(tags)) {
      tagsArray = tags;
    }

    // 4. Tạo Slug
    const shortRandom = Math.random().toString(36).substring(2, 7);
    const slug = slugify(title, { lower: true, strict: true, locale: 'vi' }) + '-' + shortRandom;

    const newWriteUp = new WriteUp({
      title,
      slug,
      content,
      category: category || 'Other',
      tags: tagsArray,
      author: authorId // Gán ID vừa lấy được
    });

    const writeUp = await newWriteUp.save();

    // Populate để trả về data đẹp nếu cần
    await writeUp.populate('author', 'username avatar');

    res.status(201).json(writeUp);
  } catch (error) {
    console.error("Lỗi Create Post:", error); // Quan trọng: In lỗi ra terminal để debug
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// Lấy danh sách bài viết (Home Feed & Search)
exports.getAllWriteUps = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    // Logic tìm kiếm
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const writeUps = await WriteUp.find(query)
      .populate('author', 'username avatar followers')
      .sort({ createdAt: -1 });

    res.json(writeUps);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tải danh sách bài viết' });
  }
};

// Lấy chi tiết bài viết (Xem bài)
exports.getWriteUpBySlug = async (req, res) => {
  try {
    const { slug } = req.params; // Do route đặt là /:slug nên biến này tên là slug (dù giá trị có thể là ID)
    let writeup;

    // KIỂM TRA: Nếu chuỗi gửi lên là một ObjectId hợp lệ -> Tìm theo ID
    if (mongoose.Types.ObjectId.isValid(slug)) {
      // Khi tìm theo ID (thường là lúc Edit), ta không cần tăng view
      writeup = await WriteUp.findById(slug)
        .populate('author', 'username avatar bio followers')
        .populate({
          path: 'comments.user',
          select: 'username avatar'
        });
    }
    // TRƯỜNG HỢP CÒN LẠI: Tìm theo Slug (cho người đọc xem)
    else {
      // Khi xem bằng Slug, ta tăng view (+1)
      writeup = await WriteUp.findOneAndUpdate(
        { slug: slug },
        { $inc: { views: 1 } },
        { new: true }
      )
        .populate('author', 'username avatar bio followers')
        .populate({
          path: 'comments.user',
          select: 'username avatar'
        });
    }

    // Nếu không tìm thấy
    if (!writeup) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }

    res.json(writeup);

  } catch (error) {
    console.error("Lỗi getDetail:", error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// ==============================================
// 2. TƯƠNG TÁC (LIKE, COMMENT, SHARE)
// ==============================================

// Like / Unlike bài viết (Đã gộp và tối ưu logic)
exports.likeWriteUp = async (req, res) => {
  try {
    const postId = req.params.id;
    // Kiểm tra kỹ middleware của bạn trả về req.user.id hay req.userId
    // Dựa vào code bạn gửi, mình lấy cả 2 trường hợp để an toàn
    const userId = req.user?.id || req.userId;

    const post = await WriteUp.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
    }

    const isLiked = post.likes.some(id => id.toString() === userId.toString());

    if (isLiked) {
      // UNLIKE: Xóa khỏi mảng likes
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // LIKE: Thêm vào mảng likes
      post.likes.push(userId);

      // --- PHẦN MỚI THÊM: TẠO THÔNG BÁO ---
      // Chỉ tạo thông báo nếu người like KHÔNG PHẢI là chủ bài viết
      if (post.author.toString() !== userId.toString()) {
        // Kiểm tra xem đã có thông báo like chưa để tránh spam (tùy chọn)
        const existingNotif = await Notification.findOne({
          sender: userId,
          recipient: post.author,
          post: post._id,
          type: 'LIKE'
        });

        if (!existingNotif) {
          await Notification.create({
            recipient: post.author, // Người nhận là chủ bài viết
            sender: userId,         // Người gửi là người đang like
            type: 'LIKE',           // Loại thông báo
            post: post._id,         // Link đến bài viết
            read: false,
            createdAt: new Date()
          });
        }
      }
      // -------------------------------------
    }

    await post.save();
    res.status(200).json(post.likes);

  } catch (err) {
    console.error("Lỗi Like:", err);
    res.status(500).json({ message: "Lỗi Server khi like bài viết" });
  }
};

// Bình luận bài viết
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID bài viết từ URL
    const { content } = req.body; // Lấy nội dung comment từ Frontend gửi lên

    // Lấy ID người comment (xử lý an toàn như lúc tạo bài viết)
    const userId = req.userId || (req.user && req.user._id) || (req.user && req.user.id);

    if (!content) {
      return res.status(400).json({ message: 'Nội dung bình luận không được để trống.' });
    }

    // 1. Tìm bài viết
    const writeUp = await WriteUp.findById(id);
    if (!writeUp) {
      return res.status(404).json({ message: 'Bài viết không tồn tại.' });
    }

    // 2. Thêm comment vào mảng
    const newComment = {
      user: userId,
      content: content,
      createdAt: new Date()
    };

    writeUp.comments.push(newComment);

    // 3. Lưu vào Database
    await writeUp.save();

    // 4. QUAN TRỌNG: Populate thông tin user (avatar, username) để Frontend hiển thị ngay lập tức
    // Mongoose sẽ điền thông tin user vào field 'user' trong mảng comments
    await writeUp.populate({
      path: 'comments.user',
      select: 'username avatar' // Chỉ lấy username và avatar cho nhẹ
    });

    // 5. Trả về toàn bộ danh sách comment mới nhất
    res.status(200).json(writeUp.comments);

  } catch (error) {
    console.error("Lỗi Comment:", error);
    res.status(500).json({ message: 'Lỗi server khi bình luận.' });
  }
};

// Share bài viết (Tăng count)
exports.incrementShare = async (req, res) => {
  try {
    const post = await WriteUp.findByIdAndUpdate(
      req.params.id,
      { $inc: { shares: 1 } },
      { new: true }
    );
    res.json({ shares: post.shares });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// 3. CÁC LOẠI FEED KHÁC
// ==============================================

// Feed từ người đang theo dõi (Subscriptions)
exports.getSubscribedFeed = async (req, res) => {
  try {
    const userId = req.userId;

    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const followingIds = currentUser.following;

    if (!followingIds || followingIds.length === 0) {
      return res.json([]);
    }

    const posts = await WriteUp.find({ author: { $in: followingIds } })
      .populate('author', 'username avatar') // Lấy thông tin người đăng
      .populate({
        path: 'comments.user',
        select: 'username avatar'
      })
      .sort({ createdAt: -1 }); // Sắp xếp bài mới nhất lên đầu

    res.json(posts);

  } catch (error) {
    console.error("Lỗi getSubscribedFeed:", error);
    res.status(500).json({ message: 'Lỗi server khi tải feed theo dõi.' });
  }
};

// Feed khám phá (Explore - Loại trừ người đang follow)
exports.getExploreFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const excludeIds = [...currentUser.following, req.userId]; // Loại trừ followings và bản thân

    const posts = await WriteUp.find({
      author: { $nin: excludeIds }
    })
      .populate('author', 'username avatar followers')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi Explore feed' });
  }
};

// Lấy bài viết của User cụ thể (Profile)
exports.getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await WriteUp.find({ author: userId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy bài viết user' });
  }
};

// Lấy bài đã like của User (Profile tab Like)
exports.getLikedPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await WriteUp.find({ likes: userId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy bài đã like' });
  }
};

// ==============================================
// 4. CHỈNH SỬA BÀI VIẾT
// ==============================================
// 1. Cập nhật bài viết
exports.updateWriteUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;

    // Lấy ID người đang request
    const userId = req.userId || (req.user && req.user._id) || (req.user && req.user.id);

    // Tìm bài viết
    const post = await WriteUp.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Bài viết không tồn tại.' });
    }

    // Kiểm tra quyền: Chỉ tác giả mới được sửa
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa bài viết này.' });
    }

    // Xử lý tags nếu có thay đổi
    let tagsArray = post.tags;
    if (tags) {
      if (typeof tags === 'string') {
        tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      } else if (Array.isArray(tags)) {
        tagsArray = tags;
      }
    }

    // Cập nhật dữ liệu
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tagsArray;

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);

  } catch (error) {
    console.error("Lỗi update:", error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật.' });
  }
};

// 2. Xóa bài viết
exports.deleteWriteUp = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || (req.user && req.user._id) || (req.user && req.user.id);

    const post = await WriteUp.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Bài viết không tồn tại.' });
    }

    // Kiểm tra quyền: Chỉ tác giả mới được xóa
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa bài viết này.' });
    }

    // Xóa bài viết
    await WriteUp.findByIdAndDelete(id);

    res.status(200).json({ message: 'Đã xóa bài viết thành công.' });

  } catch (error) {
    console.error("Lỗi delete:", error);
    res.status(500).json({ message: 'Lỗi server khi xóa.' });
  }
};

// Admin lấy tất cả bài viết
exports.getAllPostsAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') return res.status(403).json({ message: "Không có quyền!" });

    const posts = await WriteUp.find()
      .populate('author', 'username') // Lấy tên tác giả
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Admin xóa bài viết
exports.deletePostAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') return res.status(403).json({ message: "Không có quyền!" });

    await WriteUp.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa bài viết" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa bài" });
  }
};