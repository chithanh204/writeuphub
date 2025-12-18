import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
  FaSearch, FaPen, FaRegHeart, FaHeart, FaRegComment,
  FaSignOutAlt, FaHome, FaUsers, FaBell, FaCompass,
  FaShareAlt, FaUserPlus, FaUserCheck
} from 'react-icons/fa';

const HomeUser = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. SETUP USER & STATE ---
  const user = JSON.parse(localStorage.getItem('user'));
  const currentUserId = user?._id || user?.id;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Không cần state followingIds riêng nữa vì ta sẽ dùng data trong post luôn
  const isActive = (path) => location.pathname === path;

  // --- 2. API CALLS ---
  const fetchPosts = async (keyword = '') => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/writeups', {
        params: { search: keyword }
      });
      setPosts(res.data);
    } catch (error) {
      console.error("Lỗi tải bài:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // --- 3. HANDLERS ---

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchPosts(searchTerm);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  // Xử lý Like
  const handleLike = async (postId) => {
    try {
      setPosts(prevPosts => prevPosts.map(p => {
        if (p._id === postId) {
          const isLiked = p.likes.includes(currentUserId);
          return {
            ...p,
            likes: isLiked
              ? p.likes.filter(id => id !== currentUserId)
              : [...p.likes, currentUserId]
          };
        }
        return p;
      }));
      await axiosClient.put(`/writeups/${postId}/like`);
    } catch (error) {
      console.error("Lỗi like:", error);
      fetchPosts(searchTerm);
    }
  };

  // Xử lý Share
  const handleShare = async (postId) => {
    try {
      await axiosClient.put(`/writeups/${postId}/share`);
      alert("Đã sao chép link bài viết!"); // Giả lập copy
      fetchPosts(searchTerm);
    } catch (error) {
      console.error(error);
    }
  };

  // --- SỬA LẠI: Xử lý Follow / Unfollow ---
  const handleFollow = async (authorId) => {
    if (!authorId) return;

    // 1. Cập nhật giao diện ngay lập tức (Optimistic UI)
    // Chúng ta sẽ duyệt qua TẤT CẢ các bài viết.
    // Bài nào của tác giả này thì cập nhật lại mảng followers của tác giả đó.
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.author._id === authorId) {
        const followers = post.author.followers || [];
        const isFollowing = followers.includes(currentUserId);

        return {
          ...post,
          author: {
            ...post.author,
            followers: isFollowing
              ? followers.filter(id => id !== currentUserId) // Unfollow
              : [...followers, currentUserId]                // Follow
          }
        };
      }
      return post;
    }));

    try {
      // 2. Gọi API Backend
      await axiosClient.put(`/users/${authorId}/follow`);

      // 3. (Tùy chọn) Cập nhật lại localStorage để các trang khác dùng nếu cần
      // Đoạn này chỉ để đồng bộ client, logic hiển thị chính vẫn dựa vào `posts`
      const isCurrentlyFollowing = user.following.includes(authorId);
      const newFollowingList = isCurrentlyFollowing
        ? user.following.filter(id => id !== authorId)
        : [...user.following, authorId];

      const updatedUser = { ...user, following: newFollowingList };
      localStorage.setItem('user', JSON.stringify(updatedUser));

    } catch (error) {
      console.error("Lỗi follow:", error);
      alert("Có lỗi xảy ra khi theo dõi!");
      fetchPosts(); // Load lại nếu lỗi
    }
  };

  // Logic Trending
  const trendingTags = useMemo(() => {
    if (!posts.length) return [];
    const tagCounts = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        const cleanTag = tag.trim().toLowerCase();
        tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);


  // --- 4. RENDER ---
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-blue-600 text-white p-1.5 rounded font-bold text-lg">W</div>
            <span className="hidden md:block text-xl font-bold text-gray-800">WriteUpHub</span>
          </div>

          <div className="flex-1 max-w-xl relative hidden md:block">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Tìm kiếm bài viết, tags..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-full transition outline-none"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400 cursor-pointer hover:text-blue-600" onClick={() => fetchPosts(searchTerm)} />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/create-post')} className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
              <FaPen size={14} /> Viết bài
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div onClick={() => navigate(`/profile/${user?.username}`)} className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 ring-blue-300 transition">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} title="Đăng xuất" className="text-gray-400 hover:text-red-500 ml-2">
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* BODY */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* LEFT SIDEBAR */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-2 space-y-2 sticky top-24 h-fit">
          <Link to="/"><SidebarItem icon={<FaHome size={20} />} text="Home" active={isActive('/')} /></Link>
          <Link to="/subscriptions"><SidebarItem icon={<FaUsers size={20} />} text="Đang theo dõi" active={isActive('/subscriptions')} /></Link>
          <Link to="/activity"><SidebarItem icon={<FaBell size={20} />} text="Thông báo" active={isActive('/activity')} /></Link>
          <Link to="/explore"><SidebarItem icon={<FaCompass size={20} />} text="Khám phá" active={isActive('/explore')} /></Link>
        </aside>

        {/* CENTER FEED */}
        <main className="col-span-1 md:col-span-9 lg:col-span-7 space-y-4">
          {loading && <div className="space-y-4">{[1, 2, 3].map(i => <PostSkeleton key={i} />)}</div>}

          {!loading && posts.length > 0 && posts.map(post => {
            const isMyPost = user?.username === post.author?.username;
            const isLiked = post.likes.includes(currentUserId);

            // --- LOGIC MỚI: Kiểm tra dựa trên dữ liệu thật của bài viết ---
            // Backend trả về post.author.followers là 1 mảng các ID
            const isFollowingAuthor = post.author?.followers?.includes(currentUserId);

            return (
              <div key={post._id} className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition shadow-sm group">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${post.author?.username}`)}>
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 border border-gray-200 overflow-hidden">
                      {post.author?.avatar ? <img src={post.author.avatar} alt="avt" className="w-full h-full object-cover" /> : post.author?.username?.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 hover:text-blue-600 transition">{post.author?.username}</span>
                      <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  {/* NÚT FOLLOW */}
                  {!isMyPost && (
                    <button
                      onClick={() => handleFollow(post.author?._id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full transition flex items-center gap-1 border
                        ${isFollowingAuthor
                          ? 'bg-white text-gray-500 border-gray-300 hover:text-red-500 hover:border-red-300' // Đã follow
                          : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' // Chưa follow
                        }`}
                    >
                      {isFollowingAuthor ? (
                        <><FaUserCheck /> Đang theo dõi</>
                      ) : (
                        <><FaUserPlus /> Theo dõi</>
                      )}
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="md:pl-12">
                  <Link to={`/post/${post.slug}`}>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition">{post.title}</h2>
                  </Link>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-2 py-1 rounded border bg-blue-50 text-blue-600 border-blue-100">{post.category}</span>
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">#{tag}</span>
                    ))}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between text-gray-500 pt-3 border-t border-gray-50 mt-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded transition text-sm ${isLiked ? 'text-red-500' : 'hover:text-red-500 hover:bg-red-50'}`}
                      >
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                        <span>{post.likes.length}</span>
                      </button>

                      <button onClick={() => navigate(`/post/${post.slug}`)} className="flex items-center gap-1.5 hover:text-blue-500 hover:bg-blue-50 px-2 py-1 rounded transition text-sm">
                        <FaRegComment />
                        <span>{post.comments.length}</span>
                      </button>
                    </div>

                    <button onClick={() => handleShare(post._id)} className="flex items-center gap-1.5 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition text-sm">
                      <FaShareAlt />
                      {post.shares > 0 && <span className="text-xs bg-gray-200 px-1.5 rounded-full font-bold">{post.shares}</span>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && posts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500 mb-4">{searchTerm ? `Không tìm thấy bài viết cho "${searchTerm}"` : "Chưa có bài viết nào."}</p>
              {searchTerm && (
                <button onClick={() => { setSearchTerm(''); fetchPosts(''); }} className="text-blue-600 font-bold hover:underline">
                  Xóa tìm kiếm
                </button>
              )}
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR - Trending */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-900 border-b pb-2">🔥 Trending Tags</h3>
            {trendingTags.length > 0 ? trendingTags.map((item, i) => (
              <div key={i} className="flex justify-between p-2 hover:bg-gray-50 rounded cursor-pointer group" onClick={() => { setSearchTerm(item.tag); fetchPosts(item.tag); }}>
                <span className="text-gray-600 group-hover:text-blue-600">#{item.tag}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{item.count}</span>
              </div>
            )) : <p className="text-gray-400 italic text-sm">Chưa có xu hướng.</p>}
          </div>
        </aside>

      </div>
    </div>
  );
};

// Component phụ giữ nguyên
const SidebarItem = ({ icon, text, active }) => (
  <div className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all ${active ? 'bg-white text-blue-600 font-bold shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}>
    <span className={active ? 'text-blue-600' : 'text-gray-500'}>{icon}</span>
    <span>{text}</span>
  </div>
);

const PostSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse h-40"></div>
);

export default HomeUser;