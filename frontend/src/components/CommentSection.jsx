import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Link } from 'react-router-dom';

const CommentSection = ({ postId, comments, setComments, currentUser }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      // SỬA Ở ĐÂY: Đổi key từ { text } thành { content: text } để khớp với Backend
      const res = await axiosClient.post(`/writeups/${postId}/comment`, {
        content: text
      });

      setComments(res.data);
      setText('');
    } catch (error) {
      console.error("Lỗi comment:", error);
      // Alert lỗi chi tiết hơn
      alert(error.response?.data?.message || "Không thể gửi bình luận lúc này.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-xl font-bold mb-4">Bình luận ({comments.length})</h3>

      {/* Ô nhập comment */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
            {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> :
              <div className="flex items-center justify-center h-full font-bold text-gray-500">{currentUser.username[0]}</div>}
          </div>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Viết bình luận của bạn..."
              rows="2"
            ></textarea>
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg text-center mb-6">
          <Link to="/login" className="text-blue-600 font-bold hover:underline">Đăng nhập</Link> để bình luận.
        </div>
      )}

      {/* Danh sách comment */}
      <div className="space-y-6">
        {comments.map((comment, index) => (
          <div key={index} className="flex gap-3">
            <Link to={`/profile/${comment.user?.username}`}>
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer">
                {comment.user?.avatar ?
                  <img src={comment.user.avatar} className="w-full h-full object-cover" /> :
                  <div className="flex items-center justify-center h-full font-bold text-gray-500 uppercase">
                    {comment.user?.username ? comment.user.username[0] : '?'}
                  </div>
                }
              </div>
            </Link>
            <div>
              <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-none">
                <div className="flex items-center gap-2">
                  <Link to={`/profile/${comment.user?.username}`} className="font-bold text-sm hover:underline">
                    {comment.user?.username || "Người dùng ẩn"}
                  </Link>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-gray-800 text-sm mt-1">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-gray-500 text-center italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;