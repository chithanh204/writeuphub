import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
  FaHome, FaUsers, FaBell, FaCompass, FaPen, FaEdit,
  FaTrash, FaRegHeart, FaRegComment, FaShareAlt, FaCamera
} from 'react-icons/fa';

const Profile = () => {
  const { username } = useParams(); // Lấy username từ URL
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null); // Info người chủ profile
  const [posts, setPosts] = useState([]); // Danh sách bài viết hiển thị
  const [activeTab, setActiveTab] = useState('posts'); // posts | likes | activity
  const [loading, setLoading] = useState(true);

  // Lấy user hiện tại đang đăng nhập để so sánh (xem có phải profile của mình không)
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isMyProfile = currentUser?.username === username;

  // 1. Fetch thông tin User
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Lấy thông tin user
        const resUser = await axiosClient.get(`/users/${username}`);
        setProfileUser(resUser.data);

        // Mặc định load tab Posts trước
        fetchPosts('posts', resUser.data._id);
      } catch (error) {
        console.error("Lỗi profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  // 2. Hàm Fetch bài viết theo Tab
  const fetchPosts = async (tab, userId) => {
    try {
      let url = '';
      if (tab === 'posts') url = `/writeups/user/${userId}`;
      else if (tab === 'likes') url = `/writeups/user/${userId}/liked`;

      if (url) {
        const res = await axiosClient.get(url);
        setPosts(res.data);
      } else {
        setPosts([]); // Tab Activity có thể hiển thị info khác
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3.xóa bài viết
  const handleDelete = async (postId) => {
    // 1. Hỏi xác nhận
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      // 2. Gọi API xóa
      await axiosClient.delete(`/writeups/${postId}`);

      // 3. Cập nhật giao diện: Lọc bỏ bài vừa xóa khỏi state danh sách
      // Giả sử state lưu bài viết tên là 'posts'
      setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));

      alert("Đã xóa bài viết!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Lỗi khi xóa bài viết");
    }
  };

  // Xử lý chuyển tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (profileUser) fetchPosts(tab, profileUser._id);
  };

  // Sidebar (Tái sử dụng)
  const SidebarItem = ({ icon, text, path }) => (
    <div
      onClick={() => navigate(path)}
      className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm hover:translate-x-1 transition-all"
    >
      <span className="text-gray-500 text-xl">{icon}</span>
      <span className="text-base">{text}</span>
    </div>
  );

  if (loading) return <div className="text-center pt-20">Đang tải profile...</div>;
  if (!profileUser) return <div className="text-center pt-20">Không tìm thấy người dùng!</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      {/* NAVBAR (Copy từ các trang khác) */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm h-16 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-blue-600 text-white p-1.5 rounded font-bold text-lg">W</div>
          <span className="font-bold text-xl">WriteUpHub</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* --- LEFT SIDEBAR --- */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-2 space-y-2 sticky top-24 h-fit">
          <SidebarItem icon={<FaHome />} text="Home" path="/" />
          <SidebarItem icon={<FaUsers />} text="Subscriptions" path="/subscriptions" />
          <SidebarItem icon={<FaBell />} text="Activity" path="/activity" />
          <SidebarItem icon={<FaCompass />} text="Explore" path="/explore" />
        </aside>

        {/* --- MAIN CONTENT (Profile) --- */}
        <main className="col-span-1 md:col-span-9 lg:col-span-10">

          {/* 1. HEADER PROFILE (Giống hình vẽ) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 relative">

            {/* Cover Photo (Xám) */}
            <div className="h-48 bg-gray-500 relative group">
              {isMyProfile && (
                <button className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition">
                  <FaCamera />
                </button>
              )}
            </div>

            <div className="px-6 pb-6">
              <div className="flex justify-between items-end -mt-12 mb-4">
                {/* Avatar (Cam - Tròn to) */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-orange-500 border-4 border-white flex items-center justify-center text-4xl text-white font-bold overflow-hidden shadow-md">
                    {profileUser.avatar ? <img src={profileUser.avatar} className="w-full h-full object-cover" /> : profileUser.username.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Action Buttons (Giống hình vẽ) */}
                <div className="flex gap-3 mb-2">
                  {isMyProfile ? (
                    <>
                      <button
                        onClick={() => navigate('/create-post')}
                        className="px-6 py-2 bg-cyan-400 text-black font-bold rounded-lg shadow-sm hover:bg-cyan-300 transition"
                      >
                        New Post
                      </button>
                      <button
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition"
                      >
                        Edit profile
                      </button>
                    </>
                  ) : (
                    <button className="px-8 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition">
                      Theo dõi
                    </button>
                  )}
                </div>
              </div>

              {/* Info Text */}
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">{profileUser.username}</h1>
                <p className="text-gray-500 text-sm font-medium mt-1">
                  {profileUser.followers?.length || 0} subscriber
                  <span className="mx-2">•</span>
                  {profileUser.postCount || 0} bài viết
                </p>
                {profileUser.bio && <p className="mt-3 text-gray-700 max-w-2xl">{profileUser.bio}</p>}
              </div>
            </div>

            {/* TABS NAVIGATION */}
            <div className="flex border-t border-gray-200 px-6">
              {['Activity', 'Posts', 'Likes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab.toLowerCase())}
                  className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === tab.toLowerCase()
                    ? 'border-red-500 text-red-500' // Màu đỏ giống chữ "Posts" trong hình
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* 2. CONTENT LIST */}
          <div className="space-y-4">
            {activeTab === 'activity' ? (
              <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
                Chức năng Activity đang phát triển... (Hiển thị lịch sử tham gia, comment)
              </div>
            ) : posts.length > 0 ? (
              posts.map(post => (
                <div key={post._id} className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition shadow-sm group relative">
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 overflow-hidden">
                      {post.author.avatar ? <img src={post.author.avatar} className="w-full h-full object-cover" /> : post.author.username[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{post.author.username}</h3>
                      <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>

                  {/* Title & Stats */}
                  <h2
                    onClick={() => navigate(`/post/${post.slug}`)}
                    className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                  >
                    {post.title}
                  </h2>

                  {/* Hình minh họa bài viết (Nếu có trong content - mockup) */}
                  {/* <div className="h-48 bg-gray-100 rounded-lg mb-3 w-full object-cover"></div> */}

                  <div className="flex gap-4 text-gray-500 text-sm mt-3">
                    <span className="flex items-center gap-1"><FaRegHeart /> {post.likes.length}</span>
                    <span className="flex items-center gap-1"><FaRegComment /> {post.comments.length}</span>
                  </div>

                  {/* EDIT / DELETE BUTTONS (Góc dưới phải giống icon thùng rác/bút chì trong hình) */}
                  {isMyProfile && activeTab === 'posts' && (
                    <div className="absolute bottom-4 right-4 flex gap-3">
                      <Link
                        to={`/edit-post/${post._id}`}
                        className="p-2 text-gray-500 hover:text-blue-600 transition"
                        title="Sửa bài viết"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(post._id)} // Truyền ID bài viết vào
                        className="p-2 text-gray-500 hover:text-red-600 transition"
                        title="Xóa bài viết"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
                Chưa có bài viết nào.
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default Profile;