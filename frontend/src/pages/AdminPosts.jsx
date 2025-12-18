import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/writeups/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa bài này vĩnh viễn?")) {
      try {
        await axios.delete(`http://localhost:5000/api/writeups/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(posts.filter(p => p._id !== id));
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        alert("Lỗi khi xóa!");
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-600">Quản Lý Bài Viết (Admin)</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Tiêu đề</th>
              <th className="py-3 px-4 text-left">Tác giả</th>
              <th className="py-3 px-4 text-left">Ngày đăng</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">
                  <Link to={`/post/${post.slug}`} className="hover:text-blue-600 text-blue-900 truncate block max-w-md">
                    {post.title}
                  </Link>
                </td>
                <td className="py-3 px-4 text-gray-600">{post.author?.username || "Ẩn danh"}</td>
                <td className="py-3 px-4 text-gray-500 text-sm">
                  {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => handleDelete(post._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPosts;