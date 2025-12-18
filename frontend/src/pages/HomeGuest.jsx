import { useNavigate } from 'react-router-dom';
import { FaSearch, FaCode, FaShieldAlt, FaLightbulb } from 'react-icons/fa';

const HomeGuest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* 1. NAVBAR (Dành cho khách) */}
      <nav className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="text-2xl font-extrabold text-blue-700 tracking-tighter cursor-pointer">
            WriteUpHub
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600 font-semibold hover:text-blue-600 transition"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Đăng ký ngay
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION (Banner chính) */}
      <header className="relative bg-gradient-to-br from-blue-50 to-indigo-50 py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Chia sẻ kiến thức <br />
            <span className="text-blue-600">CTF & Lập trình thi đấu</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Nơi lưu trữ Write-up chất lượng, thảo luận thuật toán và kết nối cộng đồng đam mê an toàn thông tin.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg shadow-xl hover:bg-blue-700 hover:-translate-y-1 transition"
            >
              Bắt đầu viết bài
            </button>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-blue-600 border border-blue-200 text-lg font-bold rounded-lg hover:bg-gray-50 transition"
            >
              Tìm hiểu thêm
            </button>
          </div>
        </div>

        {/* Decorate circles background */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      </header>

      {/* 3. SEARCH BAR (Giả lập) */}
      <div className="bg-white py-8 -mt-8 relative z-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white p-2 rounded-full shadow-2xl border border-gray-100 flex items-center">
            <FaSearch className="text-gray-400 ml-4 text-xl" />
            <input
              type="text"
              placeholder="Tìm kiếm bài giải, lỗ hổng, thuật toán..."
              className="w-full px-4 py-3 outline-none text-gray-700 text-lg rounded-full"
            />
            <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* 4. FEATURES (Lợi ích) */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Tại sao chọn WriteUpHub?</h2>
            <p className="text-gray-500 mt-2">Nền tảng tối ưu cho việc học tập và chia sẻ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<FaShieldAlt className="text-4xl text-blue-500" />}
              title="CTF Write-ups"
              desc="Kho tàng bài giải CTF đa dạng các mảng Pwn, Web, Crypto, Reverse Engineering."
            />
            <FeatureCard
              icon={<FaCode className="text-4xl text-green-500" />}
              title="Competitive Programming"
              desc="Tổng hợp thuật toán, cấu trúc dữ liệu và lời giải các bài tập lập trình thi đấu."
            />
            <FeatureCard
              icon={<FaLightbulb className="text-4xl text-yellow-500" />}
              title="Cộng đồng chia sẻ"
              desc="Kết nối với những người cùng đam mê, học hỏi và nâng cao kỹ năng mỗi ngày."
            />
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-gray-50 border-t border-gray-200 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p className="font-semibold text-gray-700">WriteUpHub &copy; 2025</p>
          <p className="text-sm mt-2">Xây dựng bởi Nguyễn Văn Chí Thành - Khoa CNTT</p>
        </div>
      </footer>
    </div>
  );
};

// Component con hiển thị thẻ tính năng
const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 border border-gray-100 rounded-2xl hover:shadow-xl transition text-center group bg-gray-50 hover:bg-white">
    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed">
      {desc}
    </p>
  </div>
);

export default HomeGuest;