import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Địa chỉ Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động thêm Token vào header nếu có (để dùng cho các tính năng cần đăng nhập sau này)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;