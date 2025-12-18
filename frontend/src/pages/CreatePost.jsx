import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { FaBold, FaItalic, FaCode, FaLink, FaImage, FaListUl, FaQuoteRight, FaSpinner } from 'react-icons/fa';

const CreatePost = () => {
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null); // 1. Tham chiếu đến input file ẩn

  const [formData, setFormData] = useState({
    title: '',
    category: 'Other',
    tags: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // 2. State loading khi up ảnh

  const categories = ['CTF', 'Algorithm', 'System', 'Network', 'Other'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Hàm xử lý khi người dùng chọn file
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      // Gọi API upload backend vừa viết
      const res = await axiosClient.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Upload xong -> Chèn link vào bài viết
      insertTextToEditor(`![Mô tả ảnh](${res.data.url})`);

    } catch (error) {
      alert('Upload ảnh thất bại!');
      console.error(error);
    } finally {
      setIsUploading(false);
      // Reset input để chọn lại file cũ được nếu muốn
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Hàm chèn text chung (được tách ra từ logic cũ)
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
      // Đặt con trỏ ngay sau đoạn vừa chèn
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
      // Nếu bấm nút ảnh -> Kích hoạt input file ẩn
      fileInputRef.current.click();
      return;
    }

    // Các logic định dạng khác giữ nguyên...
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

    // Gọi hàm chèn logic cũ nhưng đã được rút gọn
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
      await axiosClient.post('/writeups', formData);
      alert('Đăng bài thành công!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const ToolButton = ({ icon, onClick, tooltip, disabled }) => (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      disabled={disabled}
      className={`p-2 rounded transition ${disabled ? 'text-gray-300' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
    >
      {icon}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">

        <div className="bg-blue-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wide">
            Tạo bài viết mới
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* ... (Phần Tiêu đề, Category, Tags GIỮ NGUYÊN không đổi) ... */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tiêu đề bài viết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-lg"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
              <select name="category" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={formData.category} onChange={handleChange}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
              <input type="text" name="tags" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.tags} onChange={handleChange} />
            </div>
          </div>

          {/* KHU VỰC SOẠN THẢO */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nội dung bài viết <span className="text-red-500">*</span>
            </label>

            {/* Input file ẩn dùng để chọn ảnh */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageSelect}
            />

            <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <div className="flex items-center gap-1 bg-gray-100 p-2 border-b border-gray-300">
                <ToolButton icon={<FaBold />} onClick={() => handleFormat('bold')} tooltip="In đậm" />
                <ToolButton icon={<FaItalic />} onClick={() => handleFormat('italic')} tooltip="In nghiêng" />
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <ToolButton icon={<FaCode />} onClick={() => handleFormat('code')} tooltip="Chèn Code" />
                <ToolButton icon={<FaQuoteRight />} onClick={() => handleFormat('quote')} tooltip="Trích dẫn" />
                <ToolButton icon={<FaListUl />} onClick={() => handleFormat('list')} tooltip="Danh sách" />
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <ToolButton icon={<FaLink />} onClick={() => handleFormat('link')} tooltip="Chèn Link" />

                {/* Nút ảnh có hiệu ứng loading */}
                <ToolButton
                  icon={isUploading ? <FaSpinner className="animate-spin text-blue-600" /> : <FaImage />}
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
                placeholder="Nội dung bài viết..."
                value={formData.content}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {isUploading ? 'Đang tải ảnh lên...' : 'Hỗ trợ Markdown & Upload ảnh'}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => navigate('/')} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">Hủy bỏ</button>
            <button type="submit" disabled={loading || isUploading} className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition">
              {loading ? 'Đang đăng...' : 'Đăng bài viết'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreatePost;