import React, { useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { checkAndRefreshToken } from '../../utils/TokenManager';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    Loader2,
    Filter,
    Image as ImageIcon,
    Star,
} from 'lucide-react';

type Category = { id: number; name: string };
type Section = { id: number; name: string };

type FoodRow = {
    id: number;
    name: string;
    price: number;
    description: string;
    active: boolean;
    bestSeller: boolean;
    categoryId: number | null;
    categoryName: string;
    sectionIds: number[];
    sectionNames: string[];
    thumbnailFile: string | null;
    thumbnailUrl: string | null;
};

type ApiResponse<T> = { code: number; result: T };

const FOOD_IMG_BASE = 'http://localhost:8080/restaurant/api/v1/foods/images/';

const FoodDashboardPage: React.FC = () => {
    const [foods, setFoods] = useState<FoodRow[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sections, setSections] = useState<Section[]>([]);

    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(true);



    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [editingFoodId, setEditingFoodId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: '',
        price: '',
        category_id: '' as '' | number,
        section_ids: [] as number[],
        description: '',
        active: true,
        bestSeller: false,
    });

    // modal delete confirm
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deletingName, setDeletingName] = useState('');
    const [deleting, setDeleting] = useState(false);

    const fetchFoods = async () => {
        setLoading(true);
        try {
            const url =
                `http://localhost:8080/restaurant/api/v1/foods` +
                `?limit=${limit}` +
                `&page=${page}` +
                `&keyword=${encodeURIComponent(searchQuery)}` +
                `&category_id=${categoryFilter === '' ? '' : categoryFilter}`;

            const res = await fetch(url);
            const data = await res.json();

            // NOTE: tùy backend của bạn, totalPages có thể nằm ở data.result.totalPages
            // Mình cố gắng đoán theo kiểu phổ biến.
            const list = data?.result?.foodResponseList;

            if (data.code === 0 && Array.isArray(list)) {
                const mapped: FoodRow[] = list.map((food: any) => {
                    const catId = food?.category?.id ?? null;
                    const catName = food?.category?.name ?? 'N/A';
                    const secs = Array.isArray(food?.sections) ? food.sections : [];

                    const thumbFile = food?.thumbnail ? String(food.thumbnail) : null;
                    const thumbUrl = thumbFile ? `${FOOD_IMG_BASE}${thumbFile}` : null;

                    return {
                        id: food.id,
                        name: food.name,
                        price: Number(food.price ?? 0),
                        description: food.description ?? '',
                        active: Boolean(food.active),
                        bestSeller: Boolean(food.bestSeller),
                        categoryId: catId,
                        categoryName: catName,
                        sectionIds: secs.map((s: any) => Number(s.id)).filter((x: any) => !Number.isNaN(x)),
                        sectionNames: secs.map((s: any) => s?.name).filter(Boolean),
                        thumbnailFile: thumbFile,
                        thumbnailUrl: thumbUrl,
                    };
                });

                setFoods(mapped);
                setHasNextPage(mapped.length === limit);
            } else {
                setFoods([]);
            }
        } catch (e) {
            console.error(e);
            toast.error('Lỗi khi tải danh sách món ăn');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoriesAndSections = async () => {
        try {
            const [catRes, secRes] = await Promise.all([
                fetch('http://localhost:8080/restaurant/api/v1/categories'),
                fetch('http://localhost:8080/restaurant/api/v1/sections'),
            ]);

            const catData: ApiResponse<Category[]> = await catRes.json();
            if (catData.code === 0) setCategories(catData.result || []);

            const secData: ApiResponse<Section[]> = await secRes.json();
            if (secData.code === 0) setSections(secData.result || []);
        } catch (e) {
            console.error(e);
            toast.error('Lỗi tải categories/sections');
        }
    };

    useEffect(() => {
        fetchFoods();
    }, [searchQuery, categoryFilter, limit, page]);

    useEffect(() => {
        fetchCategoriesAndSections();
    }, []);

    // helpers
    const openCreate = () => {
        setFormMode('create');
        setEditingFoodId(null);
        setForm({
            name: '',
            price: '',
            category_id: '',
            section_ids: [],
            description: '',
            active: true,
            bestSeller: false,
        });
        setIsFormOpen(true);
    };

    const openEdit = (food: FoodRow) => {
        setFormMode('edit');
        setEditingFoodId(food.id);
        setForm({
            name: food.name,
            price: String(food.price ?? ''),
            category_id: food.categoryId ?? '',
            section_ids: food.sectionIds ?? [],
            description: food.description ?? '',
            active: food.active,
            bestSeller: food.bestSeller,
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingFoodId(null);
    };

    const toggleSection = (id: number) => {
        setForm((prev) => {
            const exists = prev.section_ids.includes(id);
            return {
                ...prev,
                section_ids: exists ? prev.section_ids.filter((x) => x !== id) : [...prev.section_ids, id],
            };
        });
    };

    const submitForm = async () => {
        const token = await checkAndRefreshToken();
        if (!token) return;

        const name = form.name.trim();
        const price = Number(form.price);
        if (!name) return toast.warning('Vui lòng nhập tên món');
        if (!price || price <= 0) return toast.warning('Giá không hợp lệ');
        if (!form.category_id) return toast.warning('Vui lòng chọn danh mục');

        setSaving(true);
        try {
            const payload = {
                name,
                price,
                category_id: Number(form.category_id),
                section_ids: form.section_ids,
                description: form.description ?? '',
                active: Boolean(form.active),
                bestSeller: Boolean(form.bestSeller),
            };

            if (formMode === 'create') {
                // Nếu backend bạn có endpoint POST /foods
                const res = await fetch('http://localhost:8080/restaurant/api/v1/foods', {
                    method: 'POST',
                    headers: {
                        'Accept-Language': 'vi',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (data.code === 0) {
                    toast.success('✅ Thêm món ăn thành công');
                    closeForm();
                    fetchFoods();
                } else {
                    toast.error('❌ Thêm món ăn thất bại');
                }
            } else {
                if (!editingFoodId) return;

                // Update: giữ thumbnail cũ do backend của bạn yêu cầu thumbnail filename
                const current = foods.find((f) => f.id === editingFoodId);
                const payloadUpdate = {
                    ...payload,
                    thumbnail: current?.thumbnailFile ?? undefined,
                };

                const res = await fetch(`http://localhost:8080/restaurant/api/v1/foods/${editingFoodId}`, {
                    method: 'PUT',
                    headers: {
                        'Accept-Language': 'vi',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payloadUpdate),
                });

                const data = await res.json();
                if (data.code === 0) {
                    toast.success('✅ Cập nhật món ăn thành công');
                    closeForm();
                    fetchFoods();
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

    const openDelete = (food: FoodRow) => {
        setDeletingId(food.id);
        setDeletingName(food.name);
        setIsDeleteOpen(true);
    };

    const closeDelete = () => {
        setIsDeleteOpen(false);
        setDeletingId(null);
        setDeletingName('');
    };

    const confirmDelete = async () => {
        const token = await checkAndRefreshToken();
        if (!token || !deletingId) return;

        setDeleting(true);
        try {
            const res = await fetch(`http://localhost:8080/restaurant/api/v1/foods/${deletingId}`, {
                method: 'DELETE',
                headers: {
                    'Accept-Language': 'vi',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (data.code === 0) {
                toast.success('✅ Đã xóa món ăn');
                closeDelete();
                fetchFoods();
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

    const changePage = (newPage: number) => {
        if (newPage < 0) return;
        setPage(newPage);
    };


    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="px-4 py-3"><div className="h-4 w-10 bg-gray-200 rounded" /></td>
            <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
            <td className="px-4 py-3"><div className="h-4 w-52 bg-gray-200 rounded" /></td>
            <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
            <td className="px-4 py-3"><div className="h-14 w-14 bg-gray-200 rounded-xl" /></td>
            <td className="px-4 py-3"><div className="h-6 w-24 bg-gray-200 rounded-full" /></td>
            <td className="px-4 py-3"><div className="h-8 w-44 bg-gray-200 rounded" /></td>
        </tr>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="p-6 md:p-8 ml-64">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Quản lý Món ăn</h2>
                        <p className="text-sm text-gray-600">Tìm kiếm, lọc, chỉnh sửa món ăn trong hệ thống</p>
                    </div>

                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm món
                    </button>
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
                                onChange={(e) => {
                                    setPage(0);
                                    setSearchQuery(e.target.value);
                                }}
                                placeholder="Tìm theo tên món..."
                                className="w-full outline-none text-gray-800 placeholder:text-gray-400"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                <Filter className="w-5 h-5 text-gray-500" />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => {
                                    setPage(0);
                                    const v = e.target.value;
                                    setCategoryFilter(v === '' ? '' : Number(v));
                                }}
                                className="px-4 py-2.5 border rounded-xl border-gray-200 bg-white outline-none"
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={limit}
                                onChange={(e) => {
                                    setPage(0);
                                    setLimit(Number(e.target.value));
                                }}
                                className="px-3 py-2.5 border rounded-xl border-gray-200 bg-white outline-none"
                            >
                                {[5, 10, 20, 50].map((n) => (
                                    <option key={n} value={n}>
                                        {n}/trang
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={fetchFoods}
                                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                            >
                                Lọc
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-teal-400 text-white flex items-center justify-between">
                        <span className="font-semibold">Danh sách món ăn</span>
                        <span className="text-sm text-white/90">{foods.length} món (trang {page + 1})</span>
                    </div>

                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-center w-20">ID</th>
                                <th className="px-4 py-3 text-left">Danh mục</th>
                                <th className="px-4 py-3 text-left">Tên món</th>
                                <th className="px-4 py-3 text-right">Giá</th>
                                <th className="px-4 py-3 text-center w-28">Ảnh</th>
                                <th className="px-4 py-3 text-center w-36">Trạng thái</th>
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
                            ) : foods.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-600">
                                        Không có món ăn nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                foods.map((food) => (
                                    <tr key={food.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 text-center font-medium text-gray-900">{food.id}</td>

                                        <td className="px-4 py-3 text-left">
                                            <div className="font-medium text-gray-900">{food.categoryName}</div>
                                            {food.sectionNames.length > 0 && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Sections: {food.sectionNames.join(', ')}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-left">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">{food.name}</span>
                                                {food.bestSeller && (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                                                        <Star className="w-3 h-3" /> Best
                                                    </span>
                                                )}
                                            </div>
                                            {food.description && (
                                                <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                    {food.description}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                            {food.price.toLocaleString('vi-VN')} VNĐ
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            {food.thumbnailUrl ? (
                                                <img
                                                    src={food.thumbnailUrl}
                                                    alt={food.name}
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
                                            <span
                                                className={`px-3 py-1 text-xs font-semibold rounded-full ${food.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {food.active ? 'Hoạt động' : 'Dừng hoạt động'}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openEdit(food)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => openDelete(food)}
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

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                        onClick={() => changePage(page - 1)}
                        disabled={page === 0}
                        className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:shadow transition disabled:opacity-50"
                    >
                        Trang trước
                    </button>

                    <div className="text-sm text-gray-700">
                        Trang <span className="font-semibold">{page + 1}</span>
                    </div>

                    <button
                        onClick={() => changePage(page + 1)}
                        disabled={!hasNextPage}
                        className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:shadow transition disabled:opacity-50"
                    >
                        Trang sau
                    </button>
                </div>
            </div>

            {/* Modal Create/Edit */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/45" onClick={closeForm} />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                <div className="font-semibold">
                                    {formMode === 'create' ? 'Thêm món ăn' : `Chỉnh sửa món #${editingFoodId}`}
                                </div>
                                <button onClick={closeForm} className="p-2 rounded-lg hover:bg-white/15 transition">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-sm text-gray-600">Tên món</label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                        className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="VD: Bò bít tết sốt tiêu đen..."
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-600">Giá (VNĐ)</label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                                        className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="VD: 149000"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-600">Danh mục</label>
                                    <select
                                        value={form.category_id === '' ? '' : String(form.category_id)}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                category_id: e.target.value === '' ? '' : Number(e.target.value),
                                            }))
                                        }
                                        className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-400"
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-sm text-gray-600">Sections (chọn nhiều)</label>
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {sections.map((s) => (
                                            <label
                                                key={s.id}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition ${form.section_ids.includes(s.id)
                                                    ? 'border-blue-400 bg-blue-50'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={form.section_ids.includes(s.id)}
                                                    onChange={() => toggleSection(s.id)}
                                                />
                                                <span className="text-sm text-gray-800">{s.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-sm text-gray-600">Mô tả</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                        className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="Mô tả món..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={form.bestSeller}
                                        onChange={() => setForm((p) => ({ ...p, bestSeller: !p.bestSeller }))}
                                    />
                                    <span className="text-sm text-gray-800">Best Seller</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={form.active}
                                        onChange={() => setForm((p) => ({ ...p, active: !p.active }))}
                                    />
                                    <span className="text-sm text-gray-800">Đang hoạt động</span>
                                </div>

                                <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                                    <button
                                        onClick={closeForm}
                                        className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
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

                                {/* NOTE thumbnail upload: bạn chưa có API upload => mình không thêm input file.
                    Nếu có endpoint upload, gửi mình để mình gắn luôn. */}
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
                                    Bạn chắc chắn muốn xóa món:
                                    <span className="font-semibold"> {deletingName}</span> ?
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

export default FoodDashboardPage;
