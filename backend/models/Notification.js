const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người nhận thông báo
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },    // Người gây ra hành động
  type: {
    type: String,
    enum: ['LIKE', 'COMMENT', 'SHARE', 'FOLLOW', 'NEW_POST'],
    required: true
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'WriteUp' }, // Bài viết liên quan (nếu có)
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);