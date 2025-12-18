import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { FaTimes, FaCamera } from 'react-icons/fa';

const EditProfileModal = ({ user, isOpen, onClose, onUpdateSuccess }) => {
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);

  // Mỗi khi mở modal, fill dữ liệu cũ của user vào form
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gọi API cập nhật (Giả sử endpoint là PUT /users/:id)
      const res = await axiosClient.put(`/users/${user._id}`, formData);

      // Thông báo cho component cha biết là đã update xong và gửi data mới về
      onUpdateSuccess(res.data);
      onClose();
    } catch (error) {
      console.error("Lỗi cập nhật profile:", error);
      alert(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">

        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="font-bold text-lg text-gray-800">Chỉnh sửa hồ sơ</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">

          {/* Avatar Input (Dạng link ảnh cho đơn giản, nâng cao có thể dùng File Upload sau) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><FaCamera /></div>
                )}
              </div>
              <input
                type="text"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                placeholder="Dán link ảnh vào đây..."
                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiểu sử (Bio)</label>
            <textarea
              name="bio"
              rows="3"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Giới thiệu bản thân..."
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition disabled:bg-blue-300"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;