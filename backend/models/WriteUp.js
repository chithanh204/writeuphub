const mongoose = require('mongoose');

const writeUpSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['CTF', 'Algorithm', 'System', 'Network', 'Other'],
    default: 'Other'
  },
  tags: {
    type: [String],
    default: []
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],

  shares: {
    type: Number,
    default: 0
  } // Đếm số lượt share
  // ------------------------------------------------

}, {
  timestamps: true // Tự động tạo createdAt, updatedAt
});

writeUpSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('WriteUp', writeUpSchema);