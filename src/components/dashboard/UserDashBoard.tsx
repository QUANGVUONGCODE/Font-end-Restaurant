import React, { useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { checkAndRefreshToken } from '../../utils/TokenManager';
import { Search, Users as UsersIcon, RefreshCcw } from 'lucide-react';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>(''); // filter role FE

  const fetchUsers = async () => {
    const token = await checkAndRefreshToken();
    if (!token) return;

    setLoading(true);
    try {
      // ✅ Nếu backend hỗ trợ lấy tất cả:
      const url = `http://localhost:8080/restaurant/api/v1/user`;

      // ❗ Nếu backend BẮT BUỘC limit/page, dùng dòng này thay cho url phía trên:
      // const url = `http://localhost:8080/restaurant/api/v1/user?limit=9999&page=0`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.code === 0) {
        setUsers(data.result || []);
      } else {
        toast.error('Không tải được danh sách người dùng');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Lỗi khi tải người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const roles = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      const r = u?.role?.name;
      if (r) set.add(r);
    });
    return Array.from(set);
  }, [users]);

  const filteredUsers = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return users.filter((u) => {
      const name = (u?.full_name || '').toLowerCase();
      const phone = (u?.phone_number || '').toLowerCase();
      const email = (u?.email || '').toLowerCase();
      const role = (u?.role?.name || '').toLowerCase();

      const matchKeyword = !k || name.includes(k) || phone.includes(k) || email.includes(k);
      const matchRole = !roleFilter || (u?.role?.name || '') === roleFilter;

      return matchKeyword && matchRole;
    });
  }, [users, keyword, roleFilter]);

  const roleBadge = (roleName?: string) => {
    const r = (roleName || 'N/A').toLowerCase();
    if (r.includes('admin')) return 'bg-red-100 text-red-700';
    if (r.includes('manager')) return 'bg-indigo-100 text-indigo-700';
    if (r.includes('staff')) return 'bg-amber-100 text-amber-800';
    return 'bg-emerald-100 text-emerald-700';
  };

  const avatarText = (fullName?: string) => {
    const s = (fullName || '').trim();
    if (!s) return 'U';
    const parts = s.split(/\s+/);
    const first = parts[0]?.[0] || 'U';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return (first + last).toUpperCase();
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-10 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-gray-200 rounded" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 rounded mx-auto" /></td>
      <td className="px-4 py-3"><div className="h-4 w-56 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-52 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-6 w-24 bg-gray-200 rounded-full mx-auto" /></td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 md:p-8 ml-64">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Danh sách người dùng</h2>
            <p className="text-sm text-gray-600">Tìm kiếm & lọc role — không phân trang</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm">
              <UsersIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                Tổng: <b>{users.length}</b> — Đang hiển thị: <b>{filteredUsers.length}</b>
              </span>
            </div>

            <button
              onClick={fetchUsers}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
              disabled={loading}
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Tải lại
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-gray-500" />
              </div>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo tên / SĐT / Email..."
                className="w-full outline-none text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 border rounded-xl border-gray-200 bg-white outline-none"
              >
                <option value="">Tất cả vai trò</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setKeyword('');
                  setRoleFilter('');
                }}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Xóa lọc
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-teal-400 text-white flex items-center justify-between">
            <span className="font-semibold">Danh sách tài khoản</span>
            <span className="text-sm text-white/90">
              {loading ? 'Đang tải...' : `${filteredUsers.length} kết quả`}
            </span>
          </div>

          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-center w-20">ID</th>
                <th className="px-4 py-3 text-left">Người dùng</th>
                <th className="px-4 py-3 text-center">Số điện thoại</th>
                <th className="px-4 py-3 text-left">Địa chỉ</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-center w-40">Vai trò</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-600">
                    Không có người dùng nào.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {user.id}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                          {avatarText(user.full_name)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {user.full_name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Username: {user.username || '—'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center text-gray-800">
                      {user.phone_number || '—'}
                    </td>

                    <td className="px-4 py-3 text-gray-800">
                      <div className="line-clamp-1">{user.address || '—'}</div>
                    </td>

                    <td className="px-4 py-3 text-gray-800">
                      <div className="line-clamp-1">{user.email || '—'}</div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${roleBadge(
                          user?.role?.name
                        )}`}
                      >
                        {user?.role?.name || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default UserList;
