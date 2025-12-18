import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy token từ localStorage (hoặc nơi bạn lưu)
  const token = localStorage.getItem('token');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi tải users:", error);
      alert("Bạn không có quyền hoặc lỗi server!");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa user này? Hành động này không thể hoàn tác!")) {
      try {
        await axios.delete(`http://localhost:5000/api/users/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Cập nhật lại giao diện sau khi xóa
        setUsers(users.filter(user => user._id !== id));
        alert("Xóa thành công!");
      } catch (error) {
        alert(error.response?.data?.message || "Lỗi khi xóa");
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Quản Lý Người Dùng (Admin)</h1>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Username</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-100 transition">
                <td className="py-3 px-4 font-medium flex items-center gap-2">
                  <img src={user.avatar || "https://via.placeholder.com/30"} alt="avt" className="w-8 h-8 rounded-full object-cover" />
                  {user.username}
                </td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center p-4">Không có user nào.</p>}
      </div>
    </div>
  );
};

export default AdminUsers;