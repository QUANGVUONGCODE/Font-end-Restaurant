import React, { useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { checkAndRefreshToken } from '../../utils/TokenManager';
import { Search, Filter, Star, CalendarDays, MessageCircle, User, Utensils } from 'lucide-react';

const CommentSection: React.FC = () => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // UI filters (FE)
  const [searchQuery, setSearchQuery] = useState('');
  const [starFilter, setStarFilter] = useState<number | ''>('');

  const fetchComments = async () => {
    const token = await checkAndRefreshToken();
    if (!token) return;

    setLoading(true);
    try {
      // ✅ bỏ phân trang: gọi API không kèm page/limit
      const response = await fetch(`http://localhost:8080/restaurant/api/v1/comment`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.code === 0) {
        // backend bạn: data.result.comments
        const list = data?.result?.comments ?? data?.result ?? [];
        setComments(Array.isArray(list) ? list : []);
      } else {
        toast.error('Failed to fetch comments.');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Error fetching comments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const renderStars = (rating: number) => {
    const r = Number(rating || 0);
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= r;
          return (
            <Star
              key={i}
              className={`w-4 h-4 ${filled ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
            />
          );
        })}
      </div>
    );
  };

  const filteredComments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return comments.filter((c) => {
      const userName = (c?.user?.fullName ?? '').toLowerCase();
      const foodName = (c?.food?.name ?? '').toLowerCase();
      const content = (c?.content ?? '').toLowerCase();
      const star = Number(c?.star ?? 0);

      const matchQuery =
        !q || userName.includes(q) || foodName.includes(q) || content.includes(q);

      const matchStar = starFilter === '' ? true : star === starFilter;

      return matchQuery && matchStar;
    });
  }, [comments, searchQuery, starFilter]);

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-10 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-44 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-72 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 md:p-8 ml-64">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Danh sách bình luận</h2>
            <p className="text-sm text-gray-600">Tìm kiếm & lọc đánh giá của khách hàng</p>
          </div>

          <div className="text-sm px-4 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700">
            Tổng: <b>{filteredComments.length}</b> bình luận
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên khách / món / nội dung..."
                className="w-full outline-none text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Filter className="w-5 h-5 text-gray-500" />
              </div>

              <select
                value={starFilter === '' ? '' : String(starFilter)}
                onChange={(e) => setStarFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="px-4 py-2.5 border rounded-xl border-gray-200 bg-white outline-none"
              >
                <option value="">Tất cả sao</option>
                {[5, 4, 3, 2, 1].map((s) => (
                  <option key={s} value={s}>
                    {s} sao
                  </option>
                ))}
              </select>

              <button
                onClick={fetchComments}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                disabled={loading}
              >
                {loading ? 'Đang tải...' : 'Tải lại'}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-teal-400 text-white flex items-center justify-between">
            <span className="font-semibold">Bảng bình luận</span>
            <span className="text-sm text-white/90">
              {loading ? 'Đang tải...' : `${filteredComments.length} kết quả`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full table-auto">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-center w-20">ID</th>
                  <th className="px-4 py-3 text-left">Khách hàng</th>
                  <th className="px-4 py-3 text-left">Món ăn</th>
                  <th className="px-4 py-3 text-left">Nội dung</th>
                  <th className="px-4 py-3 text-center w-40">Đánh giá</th>
                  <th className="px-4 py-3 text-center w-44">Ngày</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : filteredComments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-600">
                      Không có bình luận phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredComments.map((comment) => {
                    const userName = comment?.user?.fullName ?? 'N/A';
                    const foodName = comment?.food?.name ?? 'N/A';
                    const content = comment?.content ?? '—';
                    const star = Number(comment?.star ?? 0);
                    const created = comment?.created_at
                      ? new Date(comment.created_at).toLocaleString('vi-VN')
                      : '—';

                    return (
                      <tr key={comment.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-center font-medium text-gray-900">
                          {comment.id}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{userName}</div>
                              <div className="text-xs text-gray-500">ID: {comment?.user?.id ?? '—'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                              <Utensils className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{foodName}</div>
                              <div className="text-xs text-gray-500">
                                Food ID: {comment?.food?.id ?? '—'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <MessageCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div className="text-gray-800 line-clamp-2">{content}</div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {renderStars(star)}
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                              {star}/5
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center text-gray-700">
                          <div className="inline-flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-gray-400" />
                            <span>{created}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};

export default CommentSection;
