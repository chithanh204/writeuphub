import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
  FaHome, FaUsers, FaBell, FaCompass,
  FaHeart, FaCommentDots, FaShare, FaUserPlus, FaPenNib
} from 'react-icons/fa';

const Activity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const isActive = (path) => location.pathname === path;

  // Gọi API lấy danh sách thông báo
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Giả sử bạn đã tạo route này ở backend
        // Nếu chưa có backend thật, mảng notifications sẽ rỗng hoặc lỗi
        const res = await axiosClient.get('/notifications');
        setNotifications(res.data);
      } catch (error) {
        console.error("Lỗi tải thông báo:", error);
        // DỮ LIỆU GIẢ LẬP (MOCK DATA) ĐỂ BẠN TEST GIAO DIỆN KHI CHƯA CÓ BACKEND
        setNotifications([
          {
            _id: 1,
            type: 'LIKE',
            sender: { username: 'hacker_mũ_cối', avatar: '' },
            post: { title: 'Lỗ hổng SQL Injection cơ bản', slug: 'sql-injection' },
            createdAt: new Date().toISOString()
          },
          {
            _id: 2,
            type: 'COMMENT',
            sender: { username: 'thanhdev', avatar: '' },
            post: { title: 'Giải bài CTF Pwnable 01', slug: 'pwn-01' },
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: 3,
            type: 'FOLLOW',
            sender: { username: 'security_guru', avatar: '' },
            createdAt: new Date(Date.now() - 100000000).toISOString()
          },
          {
            _id: 4,
            type: 'NEW_POST',
            sender: { username: 'admin_root', avatar: '' },
            post: { title: 'Thông báo bảo trì server', slug: 'maintenance' },
            createdAt: new Date(Date.now() - 200000000).toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Hàm render nội dung thông báo dựa trên Type
  const renderContent = (noti) => {
    const senderName = <span className="font-bold text-gray-900">{noti.sender?.username}</span>;
    const postTitle = noti.post ? <span className="font-bold text-gray-800">"{noti.post.title}"</span> : '';

    switch (noti.type) {
      case 'LIKE':
        return <>{senderName} đã thích bài viết {postTitle} của bạn.</>;
      case 'COMMENT':
        return <>{senderName} đã bình luận về bài viết {postTitle}.</>;
      case 'SHARE':
        return <>{senderName} đã chia sẻ bài viết {postTitle}.</>;
      case 'FOLLOW':
        return <>{senderName} đã bắt đầu theo dõi bạn.</>;
      case 'NEW_POST':
        return <>{senderName} (người bạn theo dõi) vừa đăng bài viết mới: {postTitle}.</>;
      default:
        return <>{senderName} đã tương tác với bạn.</>;
    }
  };

  // Hàm chọn icon tương ứng
  const renderIcon = (type) => {
    switch (type) {
      case 'LIKE': return <div className="bg-red-500 p-2 rounded-full text-white"><FaHeart size={14} /></div>;
      case 'COMMENT': return <div className="bg-blue-500 p-2 rounded-full text-white"><FaCommentDots size={14} /></div>;
      case 'SHARE': return <div className="bg-green-500 p-2 rounded-full text-white"><FaShare size={14} /></div>;
      case 'FOLLOW': return <div className="bg-purple-500 p-2 rounded-full text-white"><FaUserPlus size={14} /></div>;
      case 'NEW_POST': return <div className="bg-yellow-500 p-2 rounded-full text-white"><FaPenNib size={14} /></div>;
      default: return <div className="bg-gray-400 p-2 rounded-full text-white"><FaBell size={14} /></div>;
    }
  };

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
          <div className="text-lg font-bold text-gray-700">Thông báo</div>
          <div className="w-8"></div> {/* Spacer */}
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

        {/* MAIN CONTENT */}
        <main className="col-span-1 md:col-span-9 lg:col-span-7">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-xl">Hoạt động gần đây</h2>
              <button className="text-sm text-blue-600 font-semibold hover:underline">Đánh dấu đã đọc</button>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-500">Đang tải thông báo...</div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((noti) => (
                  <Link
                    key={noti._id}
                    to={noti.post ? `/post/${noti.post.slug}` : `/profile/${noti.sender?.username}`}
                    className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition ${!noti.isRead ? 'bg-blue-50/40' : ''}`}
                  >
                    {/* Icon loại thông báo */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                        {noti.sender?.avatar ?
                          <img src={noti.sender.avatar} className="w-full h-full object-cover" /> :
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                            {noti.sender?.username?.charAt(0).toUpperCase()}
                          </div>
                        }
                      </div>
                      <div className="absolute -bottom-1 -right-1 shadow-sm">
                        {renderIcon(noti.type)}
                      </div>
                    </div>

                    {/* Nội dung text */}
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {renderContent(noti)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 font-medium">
                        {new Date(noti.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>

                    {/* Ảnh thumbnail bài viết (nếu có - giả lập) */}
                    {noti.post && (
                      <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 hidden sm:block"></div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <FaBell size={30} />
                </div>
                <p className="text-gray-500">Chưa có thông báo nào.</p>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR - Để trống hoặc quảng cáo */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-2">Mẹo nhỏ</h4>
            <p className="text-sm text-blue-700">Tương tác nhiều hơn (Like, Comment) để nhận được nhiều thông báo hơn từ cộng đồng!</p>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Activity;