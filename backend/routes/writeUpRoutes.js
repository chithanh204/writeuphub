// backend/routes/writeUpRoutes.js

const express = require('express');
const router = express.Router();

// Import Controller (Chứa tất cả các hàm exports.tenHam của bạn)
const writeUpController = require('../controllers/writeUpController');
const verifyToken = require('../middleware/authMiddleware');

// =========================================================
// 1. CÁC ROUTE CỤ THỂ (ƯU TIÊN HÀNG ĐẦU)
// =========================================================

// Lấy feed những người đang follow
// URL: /api/writeups/feed/subscribed
router.get('/feed/subscribed', verifyToken, writeUpController.getSubscribedFeed);

// Lấy feed khám phá (Explore)
// URL: /api/writeups/explore (Khớp với Frontend gọi)
router.get('/explore', verifyToken, writeUpController.getExploreFeed);

// Lấy danh sách bài viết (Home / Search)
// URL: /api/writeups/
router.get('/', writeUpController.getAllWriteUps);

// Tạo bài viết mới
router.post('/', verifyToken, writeUpController.createWriteUp);


// =========================================================
// 2. CÁC ROUTE LIÊN QUAN ĐẾN USER
// =========================================================

// Lấy bài viết của 1 user cụ thể (Profile)
router.get('/user/:userId', writeUpController.getPostsByUser);

// Lấy bài viết user đã like
router.get('/user/:userId/liked', writeUpController.getLikedPostsByUser);


// =========================================================
// 3. CÁC ROUTE THAM SỐ (ID & SLUG - PHẢI ĐỂ CUỐI)
// =========================================================

// --- Tương tác với bài viết qua ID ---
router.put('/:id/like', verifyToken, writeUpController.likeWriteUp);
router.post('/:id/comment', verifyToken, writeUpController.addComment);
router.put('/:id/share', writeUpController.incrementShare);

// --- Chỉnh sửa / Xóa (qua ID) ---
router.put('/:id', verifyToken, writeUpController.updateWriteUp);
router.delete('/:id', verifyToken, writeUpController.deleteWriteUp);

// --- Route xem chi tiết qua SLUG (QUAN TRỌNG: ĐỂ CUỐI CÙNG) ---
// Nếu để dòng này lên trên, nó sẽ chặn các route khác
router.get('/:slug', writeUpController.getWriteUpBySlug);

// Xuất router để server.js sử dụng
module.exports = router;