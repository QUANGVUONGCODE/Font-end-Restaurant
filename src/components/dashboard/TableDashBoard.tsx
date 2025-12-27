import React, { useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { checkAndRefreshToken } from '../../utils/TokenManager';
import { Plus, Search, Pencil, Trash2, X, Loader2 } from 'lucide-react';

type TableRow = {
  id: number;
  table_name: string;
  capacity: number;
};

const TableDashboardPage: React.FC = () => {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(false);

  // search
  const [keyword, setKeyword] = useState('');

  // form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentTable, setCurrentTable] = useState<TableRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    capacity: '' as string | number,
  });

  // delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingName, setDeletingName] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/restaurant/api/v1/tables');
      const data = await res.json();
      if (data.code === 0) {
        setTables(data.result || []);
      } else {
        toast.error('Không tải được danh sách bàn');
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi khi tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const filteredTables = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return tables;
    return tables.filter((t) => (t.table_name || '').toLowerCase().includes(k));
  }, [tables, keyword]);

  // ===== Open/close modals =====
  const openCreate = () => {
    setFormMode('create');
    setCurrentTable(null);
    setForm({ name: '', capacity: '' });
    setIsFormOpen(true);
  };

  const openEdit = (t: TableRow) => {
    setFormMode('edit');
    setCurrentTable(t);
    setForm({ name: t.table_name, capacity: t.capacity });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setCurrentTable(null);
  };

  const openDelete = (t: TableRow) => {
    setDeletingId(t.id);
    setDeletingName(t.table_name);
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeletingId(null);
    setDeletingName('');
  };

  // ===== Validate =====
  const validate = () => {
    const name = form.name.trim();
    const cap = Number(form.capacity);
    if (!name) return 'Vui lòng nhập tên bàn';
    if (!cap || cap <= 0) return 'Số ghế không hợp lệ';
    return '';
  };

  // ===== Submit create/edit =====
  const submitForm = async () => {
    const err = validate();
    if (err) return toast.error(err);

    const token = await checkAndRefreshToken();
    if (!token) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        capacity: Number(form.capacity),
      };

      if (formMode === 'create') {
        const res = await fetch('http://localhost:8080/restaurant/api/v1/tables', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.code === 0) {
          toast.success('✅ Thêm bàn thành công');
          closeForm();
          fetchTables();
        } else toast.error('❌ Thêm bàn thất bại');
      } else {
        if (!currentTable?.id) return;

        const res = await fetch(
          `http://localhost:8080/restaurant/api/v1/tables/${currentTable.id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        const data = await res.json();
        if (data.code === 0) {
          toast.success('✅ Cập nhật bàn thành công');
          closeForm();
          fetchTables();
        } else toast.error('❌ Cập nhật thất bại');
      }
    } catch (e) {
      console.error(e);
      toast.error('❌ Lỗi kết nối');
    } finally {
      setSaving(false);
    }
  };

  // ===== Confirm delete =====
  const confirmDelete = async () => {
    const token = await checkAndRefreshToken();
    if (!token || !deletingId) return;

    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:8080/restaurant/api/v1/tables/${deletingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.code === 0) {
        toast.success('✅ Đã xóa bàn');
        closeDelete();
        fetchTables();
      } else toast.error('❌ Xóa thất bại');
    } catch (e) {
      console.error(e);
      toast.error('❌ Lỗi kết nối');
    } finally {
      setDeleting(false);
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-10 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-6 w-20 bg-gray-200 rounded-full mx-auto" /></td>
      <td className="px-4 py-3"><div className="h-8 w-40 bg-gray-200 rounded mx-auto" /></td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 md:p-8 ml-64">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Bàn ăn</h2>
            <p className="text-sm text-gray-600">Tạo, chỉnh sửa, xóa bàn trong hệ thống</p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            Thêm bàn
          </button>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Search className="w-5 h-5 text-gray-500" />
            </div>

            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên bàn..."
              className="w-full outline-none text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-teal-400 text-white flex items-center justify-between">
            <span className="font-semibold">Danh sách bàn</span>
            <span className="text-sm text-white/90">{filteredTables.length} bàn</span>
          </div>

          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-center w-20">#</th>
                <th className="px-4 py-3 text-left">Tên bàn</th>
                <th className="px-4 py-3 text-center w-40">Số ghế</th>
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
              ) : filteredTables.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-600">
                    Không có bàn nào.
                  </td>
                </tr>
              ) : (
                filteredTables.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-center font-medium text-gray-900">{idx + 1}</td>

                    <td className="px-4 py-3 text-left">
                      <div className="font-semibold text-gray-900">{t.table_name}</div>
                      <div className="text-xs text-gray-500">ID: {t.id}</div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">
                        {t.capacity} ghế
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(t)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                        >
                          <Pencil className="w-4 h-4" />
                          Sửa
                        </button>

                        <button
                          onClick={() => openDelete(t)}
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

      {/* Modal Add/Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/45" onClick={closeForm} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="font-semibold">
                  {formMode === 'create' ? 'Thêm bàn mới' : `Chỉnh sửa: ${currentTable?.table_name}`}
                </div>
                <button onClick={closeForm} className="p-2 rounded-lg hover:bg-white/15 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Tên bàn</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="VD: Bàn A1, Bàn VIP 01..."
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Số lượng ghế</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                    className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="VD: 4"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={closeForm}
                    className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                    disabled={saving}
                  >
                    Hủy
                  </button>

                  <button
                    onClick={submitForm}
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

      {/* Modal Confirm Delete */}
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
                  Bạn chắc chắn muốn xóa bàn:
                  <span className="font-semibold"> {deletingName}</span> ?
                </p>
                <p className="text-sm text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={closeDelete}
                    className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                    disabled={deleting}
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

export default TableDashboardPage;
