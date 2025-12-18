const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình Multer (Lưu tạm vào RAM trước khi up lên Cloud)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API Upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Chưa chọn file ảnh!' });
    }

    // Convert buffer sang base64 để upload lên Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'writeuphub', // Tên thư mục trên Cloudinary
    });

    // Trả về đường link ảnh
    res.json({ url: result.secure_url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload thất bại' });
  }
});

module.exports = router;