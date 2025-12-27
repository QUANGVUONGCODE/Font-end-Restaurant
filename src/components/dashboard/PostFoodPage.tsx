import React, { useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { checkAndRefreshToken } from '../../utils/TokenManager';
import { UploadCloud, Image as ImageIcon, X, Loader2, UtensilsCrossed } from 'lucide-react';

type Category = { id: number; name: string };
type Section = { id: number; name: string };

const MAX_FILE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_MB * 1024 * 1024;

const AddFood: React.FC = () => {
  const [foodData, setFoodData] = useState({
    name: '',
    price: '' as string | number,
    category_id: '' as '' | number,
    section_ids: [] as number[],
    description: '',
    active: true,
    bestSeller: 0 as 0 | 1,
  });

  const [foodImages, setFoodImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);

  // ===== Helpers =====
  const checkFileSize = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Ảnh quá lớn (> ${MAX_FILE_MB}MB): ${file.name}`);
      return false;
    }
    return true;
  };

  const previews = useMemo(() => {
    return foodImages.map((file) => ({
      file,
      key: `${file.name}-${file.size}-${file.lastModified}`,
      url: URL.createObjectURL(file),
    }));
  }, [foodImages]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  // ===== Fetch categories/sections =====
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:8080/restaurant/api/v1/categories');
      const data = await res.json();
      if (data.code === 0) setCategories(data.result || []);
    } catch (e) {
      console.error(e);
      toast.error('Không tải được danh mục');
    }
  };

  const fetchSections = async () => {
    try {
      const res = await fetch('http://localhost:8080/restaurant/api/v1/sections');
      const data = await res.json();
      if (data.code === 0) setSections(data.result || []);
    } catch (e) {
      console.error(e);
      toast.error('Không tải được sections');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSections();
  }, []);

  // ===== Form handlers =====
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFoodData((p) => ({ ...p, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setFoodData((p) => ({ ...p, category_id: v === '' ? '' : Number(v) }));
  };

  const toggleSection = (id: number) => {
    setFoodData((p) => {
      const exists = p.section_ids.includes(id);
      return {
        ...p,
        section_ids: exists ? p.section_ids.filter((x) => x !== id) : [...p.section_ids, id],
      };
    });
  };

  // ===== Upload UI handlers =====
  const addFiles = (files: File[]) => {
    const selected = files.filter(checkFileSize);

    setFoodImages((prev) => {
      const map = new Map(prev.map((f) => [`${f.name}-${f.size}-${f.lastModified}`, f]));
      selected.forEach((f) => map.set(`${f.name}-${f.size}-${f.lastModified}`, f));
      return Array.from(map.values());
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const removeImage = (key: string) => {
    setFoodImages((prev) =>
      prev.filter((f) => `${f.name}-${f.size}-${f.lastModified}` !== key)
    );
  };

  const clearAllImages = () => setFoodImages([]);

  // ===== API calls =====
  const handleUploadImages = async (foodId: number) => {
    if (foodImages.length === 0) return;

    const token = await checkAndRefreshToken();
    if (!token) return;

    const formData = new FormData();
    foodImages.forEach((img) => formData.append('files', img));

    const res = await fetch(`http://localhost:8080/restaurant/api/v1/foods/upload/${foodId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) throw new Error('Upload images failed');
    const data = await res.json();
    if (data.code !== 0) throw new Error('Upload images failed (code != 0)');
  };

  const validate = () => {
    const name = foodData.name.trim();
    const priceNum = Number(foodData.price);

    if (!name) return 'Vui lòng nhập tên món ăn';
    if (!priceNum || priceNum <= 0) return 'Vui lòng nhập giá hợp lệ';
    if (!foodData.category_id) return 'Vui lòng chọn danh mục';
    return '';
  };

  const resetForm = () => {
    setFoodData({
      name: '',
      price: '',
      category_id: '',
      section_ids: [],
      description: '',
      active: true,
      bestSeller: 0,
    });
    setFoodImages([]);
  };

  const handleAddFood = async () => {
    const err = validate();
    if (err) return toast.error(err);

    setLoading(true);
    const token = await checkAndRefreshToken();

    try {
      const payload = {
        ...foodData,
        name: foodData.name.trim(),
        price: Number(foodData.price),
        category_id: Number(foodData.category_id),
        bestSeller: foodData.bestSeller,
      };

      const res = await fetch('http://localhost:8080/restaurant/api/v1/foods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.code !== 0) {
        toast.error('❌ Tạo món ăn thất bại');
        return;
      }

      const foodId = data?.result?.id;
      toast.success('✅ Tạo món ăn thành công');

      if (foodId && foodImages.length > 0) {
        await handleUploadImages(foodId);
        toast.success('✅ Upload ảnh thành công');
      }

      resetForm();
    } catch (e) {
      console.error(e);
      toast.error('❌ Lỗi khi tạo món ăn hoặc upload ảnh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 md:p-8 ml-64">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Thêm Món Ăn</h2>
          <p className="text-sm text-gray-600">
            Post thông tin món + upload ảnh (tối đa {MAX_FILE_MB}MB/ảnh)
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
            <div className="font-semibold flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5" />
              Tạo món ăn mới
            </div>
            <div className="text-sm text-white/90">{foodImages.length} ảnh đã chọn</div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Form (3/5) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm text-gray-600">Tên món</label>
                <input
                  name="name"
                  value={foodData.name}
                  onChange={handleInputChange}
                  className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="VD: Bò bít tết sốt tiêu đen..."
                />
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Giá (VNĐ)</label>
                  <input
                    type="number"
                    name="price"
                    value={foodData.price}
                    onChange={handleInputChange}
                    className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="149000"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Danh mục</label>
                  <select
                    value={foodData.category_id === '' ? '' : String(foodData.category_id)}
                    onChange={handleCategoryChange}
                    className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none bg-white focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sections */}
              <div>
                <label className="text-sm text-gray-600">Sections (chọn nhiều)</label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sections.map((s) => (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition ${
                        foodData.section_ids.includes(s.id)
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={foodData.section_ids.includes(s.id)}
                        onChange={() => toggleSection(s.id)}
                      />
                      <span className="text-sm text-gray-800">{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-gray-600">Mô tả</label>
                <textarea
                  name="description"
                  value={foodData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Mô tả món ăn..."
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={foodData.bestSeller === 1}
                    onChange={(e) =>
                      setFoodData((p) => ({ ...p, bestSeller: e.target.checked ? 1 : 0 }))
                    }
                  />
                  Món bán chạy
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={foodData.active}
                    onChange={(e) => setFoodData((p) => ({ ...p, active: e.target.checked }))}
                  />
                  Đang hoạt động
                </label>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-60"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleAddFood}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tạo...
                    </span>
                  ) : (
                    'Đăng món'
                  )}
                </button>
              </div>
            </div>

            {/* Right: Upload (2/5) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Dropzone */}
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center">
                    <UploadCloud className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Upload ảnh món ăn</div>
                    <p className="text-sm text-gray-600">
                      Chọn nhiều ảnh nếu cần (khuyến nghị &lt; {MAX_FILE_MB}MB/ảnh).
                    </p>

                    <div className="mt-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInput}
                        className="block w-full text-sm text-gray-700
                          file:mr-4 file:py-2.5 file:px-4
                          file:rounded-xl file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-600 file:text-white
                          hover:file:bg-indigo-700
                          cursor-pointer"
                      />
                    </div>

                    {foodImages.length > 0 && (
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={clearAllImages}
                          className="text-sm text-red-600 hover:text-red-700 font-semibold"
                        >
                          Xóa hết ảnh
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-gray-900">Preview ảnh</div>
                  <div className="text-sm text-gray-600">
                    {foodImages.length === 0 ? 'Chưa chọn ảnh' : ''}
                  </div>
                </div>

                {foodImages.length === 0 ? (
                  <div className="h-40 rounded-xl bg-gray-50 border border-dashed flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <ImageIcon className="w-6 h-6 mx-auto mb-2" />
                      Chưa có ảnh nào
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {previews.map(({ url, key, file }) => (
                      <div key={key} className="relative group">
                        <img
                          src={url}
                          alt={file.name}
                          className="w-full h-24 object-cover rounded-xl border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(key)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                          title="Xóa ảnh"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="mt-1 text-[11px] text-gray-600 line-clamp-1">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500">
                * Nếu backend của bạn chỉ lưu 1 thumbnail, bạn nên chọn 1 ảnh.
              </div>
            </div>
          </div>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};

export default AddFood;
