const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

// 1. Lấy thông tin profile (Public - ai cũng xem được)
// GET /api/users/:username
router.get('/:username', userController.getUserProfile);

// 2. Cập nhật profile (Private - chỉ chính chủ mới sửa được)
// PUT /api/users/:id
// Lưu ý: Frontend đang gọi API này (axiosClient.put(`/users/${user._id}`, formData))
router.put('/:id', verifyToken, userController.updateUserProfile);

// 3. Follow / Unfollow (Private)
// PUT /api/users/:id/follow
router.put('/:id/follow', verifyToken, userController.toggleFollow);

router.get('/admin/all', verifyToken, userController.getAllUsers);
router.delete('/admin/:id', verifyToken, userController.deleteUser);

module.exports = router;