const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load biến môi trường
dotenv.config();

// Khởi tạo app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/authRoutes');
const writeUpRoutes = require('./routes/writeUpRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);

app.use('/api/writeups', writeUpRoutes);

app.use('/upload', uploadRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/users', userRoutes);


// KẾT NỐI DATABASE & CHẠY SERVER ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Đã kết nối MongoDB thành công');
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối MongoDB:', err);
  });