// client/src/pages/EditPost.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { FaBold, FaItalic, FaCode, FaLink, FaImage, FaListUl, FaQuoteRight, FaSpinner } from 'react-icons/fa';

const EditPost = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Other',
    tags: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 2. Load dữ liệu cũ
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axiosClient.get(`/writeups/${id}`);
        const post = res.data;

        setFormData({
          title: post.title,
          category: post.category,
          // Chuyển mảng tags thành chuỗi
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags,
          content: post.content
        });
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        alert("Không thể tải bài viết hoặc bài viết không tồn tại.");
        navigate('/');
      }
    };
    fetchPost();
  }, [id, navigate]);

  const categories = ['CTF', 'Algorithm', 'System', 'Network', 'Other'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý upload ảnh
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const res = await axiosClient.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      insertTextToEditor(`![Mô tả ảnh](${res.data.url})`);
    } catch (error) {
      alert('Upload ảnh thất bại!');
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const insertTextToEditor = (textToInsert) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + textToInsert + after;

    setFormData(prev => ({ ...prev, content: newText }));

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + textToInsert.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const handleFormat = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = formData.content.substring(start, end);

    if (type === 'image') {
      fileInputRef.current.click();
      return;
    }

    let textToInsert = '';
    switch (type) {
      case 'bold': textToInsert = `**${selection || 'text'}**`; break;
      case 'italic': textToInsert = `_${selection || 'text'}_`; break;
      case 'code':
        textToInsert = selection.includes('\n')
          ? `\n\`\`\`\n${selection}\n\`\`\`\n`
          : `\`${selection || 'code'}\``;
        break;
      case 'link': textToInsert = `[${selection || 'Link'}](url)`; break;
      case 'list': textToInsert = `\n- ${selection || 'Item'}`; break;
      case 'quote': textToInsert = `\n> ${selection || 'Quote'}`; break;
      default: return;
    }

    const text = formData.content;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + textToInsert + after;
    setFormData({ ...formData, content: newText });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gọi API PUT để cập nhật
      await axiosClient.put(`/writeups/${id}`, formData);
      alert('Đã lưu thay đổi thành công!');
      navigate(`/post/${id}`); // Quay về trang chi tiết
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const ToolButton = ({ icon, onClick, tooltip, disabled }) => (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      disabled={disabled}
      className={`p-2 rounded transition ${disabled ? 'text-gray-300' : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'}`}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">

        {/* 3. SỬA UI: Đổi màu header sang vàng cam để phân biệt với trang Tạo mới */}
        <div className="bg-yellow-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wide">
            Chỉnh sửa bài viết
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tiêu đề bài viết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none transition text-lg"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
              <select name="category" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none bg-white" value={formData.category} onChange={handleChange}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
              <input type="text" name="tags" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" value={formData.tags} onChange={handleChange} />
            </div>
          </div>

          {/* EDITOR */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageSelect}
            />

            <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500">
              <div className="flex items-center gap-1 bg-gray-100 p-2 border-b border-gray-300">
                <ToolButton icon={<FaBold />} onClick={() => handleFormat('bold')} tooltip="In đậm" />
                <ToolButton icon={<FaItalic />} onClick={() => handleFormat('italic')} tooltip="In nghiêng" />
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <ToolButton icon={<FaCode />} onClick={() => handleFormat('code')} tooltip="Chèn Code" />
                <ToolButton icon={<FaQuoteRight />} onClick={() => handleFormat('quote')} tooltip="Trích dẫn" />
                <ToolButton icon={<FaListUl />} onClick={() => handleFormat('list')} tooltip="Danh sách" />
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <ToolButton icon={<FaLink />} onClick={() => handleFormat('link')} tooltip="Chèn Link" />
                <ToolButton
                  icon={isUploading ? <FaSpinner className="animate-spin text-yellow-600" /> : <FaImage />}
                  onClick={() => handleFormat('image')}
                  tooltip="Upload Ảnh"
                  disabled={isUploading}
                />
              </div>

              <textarea
                ref={textareaRef}
                name="content"
                rows="15"
                className="w-full px-4 py-3 outline-none font-mono text-sm resize-y"
                value={formData.content}
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
            {/* 4. SỬA UI: Nút Hủy quay về trang trước đó thay vì về Home */}
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">Hủy bỏ</button>

            {/* 5. SỬA UI: Đổi text thành "Lưu thay đổi" và màu vàng */}
            <button type="submit" disabled={loading || isUploading} className="px-8 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-bold shadow-md transition">
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditPost;