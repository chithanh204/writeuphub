const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

// Route lấy thông tin profile: GET /api/users/:username
router.get('/:username', userController.getUserProfile);

// Route cập nhật profile (nếu bạn đã làm hàm này): PUT /api/users/profile
// router.put('/profile', verifyToken, userController.updateUserProfile);
router.put('/:id/follow', verifyToken, userController.toggleFollow);

module.exports = router;