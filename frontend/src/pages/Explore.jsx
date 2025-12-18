import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
  FaHome, FaUsers, FaBell, FaCompass, FaRegHeart,
  FaRegComment, FaShareAlt, FaSearch, FaUserPlus
} from 'react-icons/fa';

const Explore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isActive = (path) => location.pathname === path;

  // Gọi API Explore
  useEffect(() => {
    const fetchExplore = async () => {
      try {
        const res = await axiosClient.get('/writeups/explore');
        setPosts(res.data);
      } catch (error) {
        console.error("Lỗi tải Explore:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExplore();
  }, []);

  // Hàm xử lý Follow nhanh (Optional - logic frontend giả lập trước)
  const handleQuickFollow = async (authorId) => {
    try {
      // Gọi API follow thật
      // await axiosClient.put(`/users/${authorId}/follow`);
      alert(`Đã theo dõi user có ID: ${authorId}`);

      // Ẩn bài viết của người đó khỏi Explore ngay lập tức (UX trick)
      setPosts(posts.filter(p => p.author._id !== authorId));
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('Lỗi khi follow');
    }
  }

  // Sidebar Component
  const SidebarItem = ({ icon, text, path }) => (
    <div
      onClick={() => navigate(path)}
      className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${isActive(path) ? 'bg-white text-blue-600 font-bold shadow-sm border border-gray-200 translate-x-1' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm hover:translate-x-1'}`}
    >
      <span className={`${isActive(path) ? 'text-blue-600' : 'text-gray-500'} text-xl`}>{icon}</span>
      <span className="text-base">{text}</span>
    </div>
  );

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
            <input type="text" readOnly placeholder="Tìm kiếm nội dung mới..." className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full outline-none text-sm" />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div className="text-sm font-semibold text-gray-500">Khám Phá</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* LEFT SIDEBAR */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-2 space-y-2 sticky top-24 h-fit">
          <SidebarItem icon={<FaHome size={20} />} text="Home" path="/" />
          <SidebarItem icon={<FaUsers size={20} />} text="Subscriptions" path="/subscriptions" />
          <SidebarItem icon={<FaBell size={20} />} text="Activity" path="/activity" />
          <SidebarItem icon={<FaCompass size={20} />} text="Explore" path="/explore" />
        </aside>

        {/* CENTER FEED */}
        <main className="col-span-1 md:col-span-9 lg:col-span-7 space-y-4">

          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-lg shadow-lg text-white mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <FaCompass /> Khám phá cộng đồng
            </h1>
            <p className="opacity-90 text-sm">Tìm kiếm những bài viết hay từ những tác giả bạn chưa biết đến.</p>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Đang tìm kiếm bài viết mới...</div>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <div key={post._id} className="bg-white border border-gray-200 rounded-lg p-5 hover:border-purple-300 transition shadow-sm relative">

                {/* Header Post with Follow Button */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold border border-purple-200">
                      {post.author?.avatar ? <img src={post.author.avatar} className="rounded-full" /> : post.author?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">{post.author?.username}</span>
                      <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  {/* Nút Follow Nhanh */}
                  <button
                    onClick={() => handleQuickFollow(post.author._id)}
                    className="text-xs flex items-center gap-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600 px-3 py-1.5 rounded-full font-semibold transition"
                  >
                    <FaUserPlus /> Theo dõi
                  </button>
                </div>

                {/* Content Link */}
                <Link to={`/post/${post.slug}`}>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-purple-600 transition">{post.title}</h2>
                </Link>

                <div className="flex gap-2 mb-4">
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">#{post.category}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 text-gray-500 text-sm border-t border-gray-100 pt-3">
                  <button className="flex items-center gap-1 hover:text-red-500"><FaRegHeart /> {post.likes?.length}</button>
                  <button className="flex items-center gap-1 hover:text-blue-500"><FaRegComment /> {post.comments?.length}</button>
                  <button className="flex items-center gap-1 hover:text-gray-800"><FaShareAlt /></button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Bạn đã xem hết mọi thứ!</h3>
              <p className="text-gray-500">Hoặc bạn đã theo dõi tất cả mọi người trên WriteUpHub rồi.</p>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR (Trending Tags) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase flex items-center gap-2">
              🔥 Chủ đề đang hot
            </h3>
            <div className="flex flex-wrap gap-2">
              {['CTF', 'WebSecurity', 'Cryptography', 'Pwnable', 'ReverseEngineering', 'ReactJS', 'NodeJS'].map((tag, i) => (
                <span key={i} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded cursor-pointer transition">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Explore;