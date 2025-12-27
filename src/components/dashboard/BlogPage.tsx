import React, { useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { checkAndRefreshToken } from '../../utils/TokenManager';
import {
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

type Blog = {
  id: number;
  title: string;
  content: string;
  thumbnail: string | null;
};

const BLOG_IMG_BASE = 'http://localhost:8080/restaurant/api/v1/blog/images/';

const BlogDashboardPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  // search
  const [searchQuery, setSearchQuery] = useState('');

  // edit modal
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    thumbnail: null as string | null,
  });

  // delete confirm modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  // ===== Fetch Blogs =====
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/restaurant/api/v1/blog');
      const data = await response.json();
      if (data.code === 0) {
        setBlogs(data.result || []);
      } else {
        toast.error('❌ Không tải được danh sách bài viết');
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('❌ Lỗi kết nối khi tải bài viết');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter((b) => (b.title || '').toLowerCase().includes(q));
  }, [blogs, searchQuery]);

  // ===== Edit =====
  const openEdit = (blog: Blog) => {
    setCurrentBlog(blog);
    setForm({
      title: blog.title || '',
      content: blog.content || '',
      thumbnail: blog.thumbnail || null,
    });
    setIsEditing(true);
  };

  const closeEdit = () => {
    setIsEditing(false);
    setCurrentBlog(null);
    setSaving(false);
  };

  const handleUpdateBlog = async () => {
    if (!currentBlog) return;

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title || !content) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }

    const token = await checkAndRefreshToken();
    if (!token) return;

    setSaving(true);
    try {
      const payload = {
        title,
        content,
        thumbnail: form.thumbnail, // giữ nguyên thumbnail filename
      };

      const response = await fetch(`http://localhost:8080/restaurant/api/v1/blog/${currentBlog.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.code === 0) {
        toast.success('✅ Cập nhật bài viết thành công');
        closeEdit();
        fetchBlogs();
      } else {
        toast.error('❌ Cập nhật bài viết thất bại');
      }
    } catch (e) {
      console.error(e);
      toast.error('❌ Lỗi kết nối khi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  // ===== Delete =====
  const openDelete = (blog: Blog) => {
    setDeleteTarget({ id: blog.id, title: blog.title });
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeleteTarget(null);
    setDeleting(false);
  };

  const confirmDelete = async () => {
    const token = await checkAndRefreshToken();
    if (!token || !deleteTarget) return;

    setDeleting(true);
    try {
      const response = await fetch(`http://localhost:8080/restaurant/api/v1/blog/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.code === 0) {
        toast.success('✅ Đã xóa bài viết');
        closeDelete();
        fetchBlogs();
      } else {
        toast.error('❌ Xóa bài viết thất bại');
      }
    } catch (e) {
      console.error(e);
      toast.error('❌ Lỗi kết nối khi xóa');
    } finally {
      setDeleting(false);
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-3 text-center"><div className="h-4 w-10 bg-gray-200 rounded mx-auto" /></td>
      <td className="px-4 py-3"><div className="h-4 w-3/4 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3 text-center"><div className="h-14 w-14 bg-gray-200 rounded-xl mx-auto" /></td>
      <td className="px-4 py-3 text-center"><div className="h-8 w-40 bg-gray-200 rounded mx-auto" /></td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 md:p-8 ml-64">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Bài Viết</h2>
            <p className="text-sm text-gray-600">Tìm kiếm, chỉnh sửa và xóa bài viết</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Search className="w-5 h-5 text-gray-500" />
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề..."
              className="w-full outline-none text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-teal-400 text-white flex items-center justify-between">
            <span className="font-semibold">Danh sách bài viết</span>
            <span className="text-sm text-white/90">{filteredBlogs.length} bài</span>
          </div>

          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-center w-24">STT</th>
                <th className="px-4 py-3 text-left">Tiêu đề</th>
                <th className="px-4 py-3 text-center w-32">Ảnh</th>
                <th className="px-4 py-3 text-center w-56">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-600">
                    Không có bài viết nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog, idx) => {
                  const img = blog.thumbnail ? `${BLOG_IMG_BASE}${blog.thumbnail}` : null;

                  return (
                    <tr key={blog.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-center font-medium text-gray-900">{idx + 1}</td>

                      <td className="px-4 py-3 text-left">
                        <div className="font-semibold text-gray-900 line-clamp-1">{blog.title}</div>
                        {blog.content && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {blog.content}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {img ? (
                          <img
                            src={img}
                            alt={blog.title}
                            className="w-14 h-14 object-cover mx-auto rounded-xl border"
                            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                          />
                        ) : (
                          <div className="w-14 h-14 mx-auto rounded-xl bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(blog)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                          >
                            <Pencil className="w-4 h-4" />
                            Sửa
                          </button>
                          <button
                            onClick={() => openDelete(blog)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa
                          </button>
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

      {/* ===== Edit Modal ===== */}
      {isEditing && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/45" onClick={closeEdit} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="font-semibold">Chỉnh sửa bài viết</div>
                <button onClick={closeEdit} className="p-2 rounded-lg hover:bg-white/15 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Tiêu đề</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Nhập tiêu đề..."
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Nội dung</label>
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                    rows={6}
                    placeholder="Nhập nội dung..."
                  />
                </div>

                {/* Preview thumbnail (nếu có) */}
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">Ảnh hiện tại:</div>
                  {form.thumbnail ? (
                    <img
                      src={`${BLOG_IMG_BASE}${form.thumbnail}`}
                      className="w-16 h-16 rounded-xl border object-cover"
                      alt="thumb"
                      onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                    />
                  ) : (
                    <span className="text-sm text-gray-500">Không có</span>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={closeEdit}
                    className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    Hủy
                  </button>

                  <button
                    onClick={handleUpdateBlog}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition disabled:opacity-60"
                  >
                    {saving ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang lưu...
                      </span>
                    ) : (
                      'Lưu'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Confirm Modal ===== */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/45" onClick={closeDelete} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-red-500 to-pink-600 text-white">
                <div className="font-semibold">Xác nhận xóa</div>
                <button onClick={closeDelete} className="p-2 rounded-lg hover:bg-white/15 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-gray-800">
                  Bạn chắc chắn muốn xóa bài viết:
                  <span className="font-semibold"> {deleteTarget?.title}</span>?
                </p>
                <p className="text-sm text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={closeDelete}
                    className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    Hủy
                  </button>

                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-lg transition disabled:opacity-60"
                  >
                    {deleting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang xóa...
                      </span>
                    ) : (
                      'Xóa'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default BlogDashboardPage;
