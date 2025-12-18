import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import CommentSection from '../components/CommentSection'; // Import Component bạn vừa tạo
import { FaArrowLeft, FaHeart, FaRegHeart, FaShareAlt, FaCalendarAlt, FaUser } from 'react-icons/fa';

const PostDetail = () => {
  const { slug } = useParams(); // Lấy slug từ URL
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]); // State riêng cho comments để update realtime

  // Lấy user hiện tại để check like và truyền xuống comment
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser?._id || currentUser?.id;

  // Gọi API lấy chi tiết bài viết
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const res = await axiosClient.get(`/writeups/${slug}`);
        setPost(res.data);

        // Quan trọng: Set comments từ dữ liệu bài viết vào state riêng
        setComments(res.data.comments || []);
      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetail();
  }, [slug]);

  // Xử lý Like (Copy từ HomeUser sang để đồng bộ logic)
  const handleLike = async () => {
    if (!currentUser) return alert("Vui lòng đăng nhập để like!");
    try {
      // Optimistic UI update
      const isLiked = post.likes.includes(currentUserId);
      const newLikes = isLiked
        ? post.likes.filter(id => id !== currentUserId)
        : [...post.likes, currentUserId];

      setPost({ ...post, likes: newLikes });

      await axiosClient.put(`/writeups/${post._id}/like`);
    } catch (error) {
      console.error("Lỗi like:", error);
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải bài viết...</div>;
  if (!post) return <div className="p-10 text-center">Bài viết không tồn tại.</div>;

  const isLiked = post.likes?.includes(currentUserId);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b z-10 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition">
            <FaArrowLeft />
          </button>
          <span className="font-bold text-gray-700 truncate">{post.title}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Post Header: Category & Title */}
        <span className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full">
          {post.category}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Author Info */}
        <div className="flex items-center justify-between mb-8 border-b pb-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${post.author?.username}`)}>
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              {post.author?.avatar ?
                <img src={post.author.avatar} className="w-full h-full object-cover" /> :
                <div className="flex items-center justify-center h-full text-gray-500"><FaUser /></div>
              }
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{post.author?.username}</p>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <FaCalendarAlt size={12} />
                <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                <span>•</span>
                <span>{post.views || 0} lượt xem</span>
              </div>
            </div>
          </div>

          {/* Action Buttons (Like/Share) */}
          <div className="flex gap-2">
            <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${isLiked ? 'bg-red-50 text-red-500 border-red-200' : 'hover:bg-gray-50 border-gray-200'}`}>
              {isLiked ? <FaHeart /> : <FaRegHeart />}
              <span className="font-bold">{post.likes.length}</span>
            </button>
            <button className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600">
              <FaShareAlt />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="prose prose-lg max-w-none text-gray-800 mb-10">
          {/* Render HTML content (nếu content có thẻ html) hoặc text thường */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} style={{ whiteSpace: 'pre-line' }} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-10">
          {post.tags?.map((tag, i) => (
            <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>

        {/* --- PHẦN COMMENT --- */}
        <CommentSection
          postId={post._id}
          comments={comments}
          setComments={setComments}
          currentUser={currentUser}
        />

      </div>
    </div>
  );
};

export default PostDetail;