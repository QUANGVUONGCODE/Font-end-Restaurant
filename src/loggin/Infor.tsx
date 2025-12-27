import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  Copy,
  LogOut,
  RefreshCcw,
} from 'lucide-react';
import { checkAndRefreshToken } from '../utils/TokenManager';

interface Role {
  id: number;
  name: string;
}

interface MyInfoResponse {
  code: number;
  result: {
    id: number;
    full_name: string;
    phone_number: string;
    address: string;
    email: string;
    date_of_birth: string; // "2004-06-04T17:00:00.000+00:00"
    active: boolean;
    created_at: string; // "2025-11-30T10:43:09.402992"
    updated_at: string;
    role: Role;
  };
}

interface UserInfo {
  id: number;
  full_name: string;
  phone_number: string;
  address: string;
  email: string;
  date_of_birth: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  role: Role;
}

const API_MY_INFO = 'http://localhost:8080/restaurant/api/v1/user/myInfo';

const formatDateTimeVN = (value?: string) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value; // fallback nếu backend trả format lạ
  return d.toLocaleString('vi-VN');
};

const formatDateVN = (value?: string) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('vi-VN');
};

const UserInfoPage: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const statusBadge = useMemo(() => {
    if (!user) return null;
    return user.active
      ? { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Đang hoạt động' }
      : { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: <XCircle className="w-4 h-4" />, label: 'Bị vô hiệu hóa' };
  }, [user]);

  const fetchMyInfo = async () => {
    setLoading(true);
    try {
      const token = await checkAndRefreshToken();
      if (!token) {
        toast.error('❌ Bạn chưa đăng nhập!');
        setUser(null);
        return;
      }

      const res = await fetch(API_MY_INFO, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data: MyInfoResponse = await res.json();

      if (data.code === 0) {
        setUser(data.result);
      } else {
        toast.error('❌ Không lấy được thông tin người dùng');
        setUser(null);
      }
    } catch (e) {
      console.error(e);
      toast.error('❌ Lỗi kết nối');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('✅ Đã copy');
    } catch {
      toast.error('❌ Không copy được');
    }
  };

  const handleLogout = () => {
    // Tuỳ dự án bạn lưu token ở đâu thì xoá chỗ đó
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    toast.success('✅ Đã đăng xuất');
    // bạn có thể navigate về /login ở đây
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-6" />
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 rounded" />
              <div className="h-4 w-4/6 bg-gray-200 rounded" />
              <div className="h-4 w-3/6 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow mb-4">
            <UserIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không có dữ liệu</h2>
          <p className="text-gray-600 mb-6">Bạn hãy đăng nhập hoặc thử tải lại.</p>
          <button
            onClick={fetchMyInfo}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition"
          >
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
                <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
              </div>
            </div>
          </div>

          
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Top */}
          <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-blue-100 text-sm mb-1">Xin chào</p>
                <h2 className="text-2xl font-bold">{user.full_name}</h2>
                <p className="text-blue-100 text-sm mt-1">User ID: #{user.id}</p>
              </div>

              {statusBadge && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusBadge.bg} ${statusBadge.border} border`}>
                  <span className={statusBadge.text}>{statusBadge.icon}</span>
                  <span className={`font-semibold ${statusBadge.text}`}>{statusBadge.label}</span>
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 break-all">{user.email}</p>
                </div>
                <button
                  onClick={() => copyText(user.email)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  title="Copy"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Số điện thoại</p>
                  <p className="font-medium text-gray-900">{user.phone_number}</p>
                </div>
                <button
                  onClick={() => copyText(user.phone_number)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  title="Copy"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:shadow-md transition sm:col-span-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Địa chỉ</p>
                  <p className="font-medium text-gray-900">{user.address || 'Chưa cập nhật'}</p>
                </div>
              </div>

              {/* DOB */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Ngày sinh</p>
                  <p className="font-medium text-gray-900">{formatDateVN(user.date_of_birth)}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-slate-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Quyền</p>
                  <p className="font-medium text-gray-900">{user.role?.name || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Footer meta */}
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="text-gray-600">
                <span className="text-gray-500">Tạo lúc: </span>
                <span className="font-medium">{formatDateTimeVN(user.created_at)}</span>
              </div>
              <div className="text-gray-600">
                <span className="text-gray-500">Cập nhật: </span>
                <span className="font-medium">{formatDateTimeVN(user.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default UserInfoPage;
