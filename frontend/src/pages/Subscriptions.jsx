import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
  FaHome, FaUsers, FaBell, FaCompass, FaRegHeart,
  FaRegComment, FaShareAlt, FaUserPlus, FaSearch
} from 'react-icons/fa';

const Subscriptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isActive = (path) => location.pathname === path;

  // Gọi API lấy bài viết từ người đã follow
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        // --- ĐÃ SỬA: Thêm '/subscribed' vào cuối đường dẫn ---
        const res = await axiosClient.get('/writeups/feed/subscribed');
        setPosts(res.data);
      } catch (error) {
        console.error("Lỗi tải feed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  // Component Sidebar (Tái sử dụng để code gọn hơn)
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
      {/* NAVBAR (Giữ nguyên như HomeUser để đồng bộ) */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-blue-600 text-white p-1.5 rounded font-bold text-lg">W</div>
            <span className="hidden md:block text-xl font-bold text-gray-800">WriteUpHub</span>
          </div>
          <div className="flex-1 max-w-xl relative hidden md:block">
            <input type="text" readOnly placeholder="Tìm kiếm trong bài viết đã theo dõi..." className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full outline-none text-sm" />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div className="text-sm font-semibold text-gray-500">Kênh Đăng Ký</div>
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

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaUsers className="text-blue-600" /> Bài viết từ người bạn theo dõi
            </h1>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Đang tải bảng tin...</div>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <div key={post._id} className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition shadow-sm">
                {/* Header Post */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                    {post.author?.avatar ? <img src={post.author.avatar} className="rounded-full" /> : post.author?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">{post.author?.username}</span>
                    <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                {/* Content Link */}
                <Link to={`/post/${post.slug}`}>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition">{post.title}</h2>
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
            // EMPTY STATE: Gợi ý đi follow người khác
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200 border-dashed">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <FaUserPlus size={30} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Bạn chưa theo dõi ai, hoặc họ chưa viết bài</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Hãy khám phá cộng đồng và theo dõi những tác giả tài năng để lấp đầy bảng tin của bạn.
              </p>
              <button
                onClick={() => navigate('/explore')} // Giả sử có trang Explore
                className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                Khám phá cộng đồng ngay
              </button>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR (Gợi ý follow) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">Gợi ý theo dõi</h3>
            {/* Mockup list suggested users */}
            <div className="space-y-4">
              {['HoangHacker', 'CyberJutsu', 'NgonNguC'].map((u, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <span className="text-sm font-medium">{u}</span>
                  </div>
                  <button className="text-xs text-blue-600 font-bold hover:underline">Follow</button>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Subscriptions;