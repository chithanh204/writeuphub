import { useEffect, useState } from 'react';
import HomeGuest from './HomeGuest'; // File bạn đã gửi ở trên
import HomeUser from './HomeUser';   // File bạn đã gửi ở trên

const Home = () => {
  // Kiểm tra xem có token/user trong localStorage không
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user && token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(true);
    }
  }, []);

  // Nếu đã đăng nhập -> Hiện giao diện User
  // Nếu chưa -> Hiện giao diện Guest (Landing page)
  return isLoggedIn ? <HomeUser /> : <HomeGuest />;
};

export default Home;