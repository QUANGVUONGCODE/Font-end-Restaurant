import React, { useEffect, useMemo, useState } from 'react';
import { checkAndRefreshToken } from '../../utils/TokenManager';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Plus, Search, Pencil, Trash2, X, Loader2 } from 'lucide-react';

type Category = { id: number; name: string };
type ApiResponse<T> = { code: number; result: T };

const CategoryDashboardPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // search
  const [q, setQ] = useState('');

  // modal create/edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);

  // modal delete confirm
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingName, setDeletingName] = useState<string>('');
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const token = await checkAndRefreshToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/restaurant/api/v1/categories', {
        headers: {
          'Accept-Language': 'vi',
          Authorization: `Bearer ${token}`,
        },
      });

      const data: ApiResponse<Category[]> = await res.json();
      if (data.code === 0) {
        setCategories(Array.isArray(data.result) ? data.result : []);
      } else {
        toast.error('Không tải được danh mục');
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(key) || String(c.id).includes(key));
  }, [categories, q]);

  // Open/Close modals
  const openCreate = () => {
    setFormMode('create');
    setEditingId(null);
    setNameInput('');
    setIsFormOpen(true);
  };

  const openEdit = (c: Category) => {
    setFormMode('edit');
    setEditingId(c.id);
    setNameInput(c.name);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setNameInput('');
  };

  const openDelete = (c: Category) => {
    setDeletingId(c.id);
    setDeletingName(c.name);
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeletingId(null);
    setDeletingName('');
  };

  // Create/Edit submit
  const handleSubmit = async () => {
    const token = await checkAndRefreshToken();
    if (!token) return;

    const name = nameInput.trim();
    if (!name) {
      toast.warning('Vui lòng nhập tên danh mục');
      return;
    }

    setSaving(true);
    try {
      if (formMode === 'create') {
        const res = await fetch('http://localhost:8080/restaurant/api/v1/categories', {
          method: 'POST',
          headers: {
            'Accept-Language': 'vi',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        });

        const data: ApiResponse<any> = await res.json();
        if (data.code === 0) {
          toast.success('✅ Đã thêm danh mục');
          closeForm();
          fetchCategories();
        } else {
          toast.error('❌ Thêm danh mục thất bại');
        }
      } else {
        if (!editingId) return;

        const res = await fetch(`http://localhost:8080/restaurant/api/v1/categories/${editingId}`, {
          method: 'PUT',
          headers: {
            'Accept-Language': 'vi',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        });

        const data: ApiResponse<any> = await res.json();
        if (data.code === 0) {
          toast.success('✅ Đã cập nhật danh mục');
          closeForm();
          fetchCategories();
        } else {
          toast.error('❌ Cập nhật thất bại');
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('❌ Lỗi kết nối');
    } finally {
      setSaving(false);
    }
  };

  // Delete confirm
  const handleDelete = async () => {
    const token = await checkAndRefreshToken();
    if (!token || !deletingId) return;

    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:8080/restaurant/api/v1/categories/${deletingId}`, {
        method: 'DELETE',
        headers: {
          'Accept-Language': 'vi',
          Authorization: `Bearer ${token}`,
        },
      });

      const data: ApiResponse<any> = await res.json();
      if (data.code === 0) {
        toast.success('✅ Đã xóa danh mục');
        closeDelete();
        fetchCategories();
      } else {
        toast.error('❌ Xóa thất bại');
      }
    } catch (e) {
      console.error(e);
      toast.error('❌ Lỗi kết nối');
    } finally {
      setDeleting(false);
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-3 text-center">
        <div className="h-4 w-10 bg-gray-200 rounded mx-auto" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-52 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-8 w-44 bg-gray-200 rounded mx-auto" />
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 md:p-8 ml-64">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Danh mục</h2>
            <p className="text-sm text-gray-600">Thêm, sửa, xóa danh mục món ăn</p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            Thêm danh mục
          </button>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Search className="w-5 h-5 text-gray-500" />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên hoặc ID..."
              className="w-full outline-none text-gray-800 placeholder:text-gray-400"
            />
            <button
              onClick={fetchCategories}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow transition"
            >
              Làm mới
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-teal-400 text-white flex items-center justify-between">
            <span className="font-semibold">Danh sách danh mục</span>
            <span className="text-sm text-white/90">{filtered.length} danh mục</span>
          </div>

          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-center w-24">ID</th>
                <th className="px-4 py-3 text-left">Tên danh mục</th>
                <th className="px-4 py-3 text-center w-52">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-600">
                    Không có danh mục nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-center font-medium text-gray-900">{c.id}</td>
                    <td className="px-4 py-3 text-left text-gray-800">{c.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                        >
                          <Pencil className="w-4 h-4" />
                          Sửa
                        </button>
                        <button
                          onClick={() => openDelete(c)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create/Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/45" onClick={closeForm} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="font-semibold">
                  {formMode === 'create' ? 'Thêm danh mục' : 'Chỉnh sửa danh mục'}
                </div>
                <button onClick={closeForm} className="p-2 rounded-lg hover:bg-white/15 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <label className="text-sm text-gray-600">Tên danh mục</label>
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="VD: Bò, Hải sản, Tráng miệng..."
                />

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={closeForm}
                    className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    Hủy
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition disabled:opacity-60"
                  >
                    {saving ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang lưu...
                      </span>
                    ) : formMode === 'create' ? (
                      'Thêm'
                    ) : (
                      'Cập nhật'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Confirm */}
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
                  Bạn chắc chắn muốn xóa danh mục:
                  <span className="font-semibold"> {deletingName}</span> ?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Hành động này không thể hoàn tác.
                </p>

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={closeDelete}
                    className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    Hủy
                  </button>

                  <button
                    onClick={handleDelete}
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

export default CategoryDashboardPage;
