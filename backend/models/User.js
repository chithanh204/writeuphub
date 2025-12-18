const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Không được trùng tên
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true, // Email duy nhất
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: "" // Link ảnh đại diện
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  bio: {
    type: String, // Giới thiệu bản thân
    default: ""
  },

  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }], // Danh sách người đang theo dõi mình

  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }], // Danh sách người mình đang theo dõi
  savedWriteUps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WriteUp' // Tham chiếu sang model WriteUp
  }],
  // ---------------------------------------------------

}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);