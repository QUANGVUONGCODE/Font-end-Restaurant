import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '../../utils/navagation';
import { toast } from 'sonner';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';

type FoodItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  thumbnail: string;
  bestSeller: boolean;
  sectionName?: string;
};

type Section = { id: number; name: string };
type Category = { id: number; name: string };

const LIMIT = 12;

const Food: React.FC = () => {
  const { goToFoodDetail } = useNavigation();

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filters
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Paging
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Loading
  const [loading, setLoading] = useState(false);

  // close dropdown when click outside
  const sectionDropdownRef = useRef<HTMLDivElement | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);

  /* ================= FETCH SECTIONS ================= */
  const fetchSections = async () => {
    try {
      const res = await fetch('http://localhost:8080/restaurant/api/v1/sections');
      const data = await res.json();
      if (data.code === 0) setSections(Array.isArray(data.result) ? data.result : []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:8080/restaurant/api/v1/categories');
      const data = await res.json();
      if (data.code === 0) setCategories(Array.isArray(data.result) ? data.result : []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FETCH FOODS ================= */
  const fetchFoods = async (
    sectionId: number | null = null,
    page: number = 1,
    keyword = '',
    categoryId: number | null = null
  ) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/restaurant/api/v1/foods?limit=${LIMIT}&page=${page - 1}&keyword=${encodeURIComponent(
          keyword
        )}&category_id=${categoryId ?? ''}&section_id=${sectionId ?? ''}`
      );
      const data = await res.json();

      if (data.code === 0) {
        const rawList = data.result?.foodResponseList || [];
        const activeList = rawList.filter(
          (f: any) => f.active === true || f.active === 1
        );
        const list = activeList.map((food: any) => ({
          id: food.id,
          name: food.name,
          price: food.price,
          bestSeller: !!food.bestSeller,
          description: food.description,
          thumbnail: `http://localhost:8080/restaurant/api/v1/foods/images/${food.thumbnail}`,
        }));

        setFoods(list);
        setTotalPages(Number(data.result?.totalPages || 1));
        setCurrentPage(page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= INIT ================= */
  useEffect(() => {
    fetchSections();
    fetchCategories();
    fetchFoods(null, 1, '', null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= DEBOUNCE SEARCH ================= */
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  /* ================= FETCH WHEN FILTER CHANGES ================= */
  useEffect(() => {
    fetchFoods(selectedSection, 1, searchQuery, selectedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSection, selectedCategory, searchQuery]);

  /* ================= CLICK OUTSIDE DROPDOWN ================= */
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;

      if (sectionDropdownRef.current && !sectionDropdownRef.current.contains(target)) {
        setSectionDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(target)) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  /* ================= HANDLERS ================= */
  const handleAddToCart = (e: React.MouseEvent, foodId: number, price: number) => {
    e.stopPropagation();

    const cart: [number, number][] = JSON.parse(localStorage.getItem('cart') || '[]');
    const prices: [number, number][] = JSON.parse(localStorage.getItem('productPrices') || '[]');

    const index = cart.findIndex((i) => i[0] === foodId);

    if (index !== -1) cart[index][1] += 1;
    else {
      cart.push([foodId, 1]);
      prices.push([foodId, price]);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('productPrices', JSON.stringify(prices));

    toast.success('Đã thêm vào giỏ hàng');
  };

  const activeSectionLabel = useMemo(() => {
    if (selectedSection === null) return 'Tất cả section';
    return sections.find((s) => s.id === selectedSection)?.name || 'Chọn section';
  }, [sections, selectedSection]);

  const activeCategoryLabel = useMemo(() => {
    if (selectedCategory === null) return 'Tất cả category';
    return categories.find((c) => c.id === selectedCategory)?.name || 'Chọn category';
  }, [categories, selectedCategory]);

  const clearFilters = () => {
    setSelectedSection(null);
    setSelectedCategory(null);
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
    setSectionDropdownOpen(false);
    setCategoryDropdownOpen(false);
  };

  const goPrev = () => {
    if (currentPage <= 1) return;
    const p = currentPage - 1;
    fetchFoods(selectedSection, p, searchQuery, selectedCategory);
  };

  const goNext = () => {
    if (currentPage >= totalPages) return;
    const p = currentPage + 1;
    fetchFoods(selectedSection, p, searchQuery, selectedCategory);
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thực Đơn</h1>
            <p className="text-gray-600 mt-1">
              Tìm món theo tên + lọc theo section & category theo kiểu “modern filter bar”.
            </p>
          </div>

          {/* Quick stats */}
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{foods.length}</span> món / trang
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            {/* Search */}
            <div className="flex items-center gap-3 w-full lg:w-[480px]">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-gray-500" />
              </div>

              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm món ăn theo tên..."
                className="w-full px-3 py-2.5 outline-none text-gray-800 placeholder:text-gray-400"
              />

              {searchInput.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-600"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Section + Category dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              {/* SECTION */}
              <div ref={sectionDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setSectionDropdownOpen((v) => !v);
                    setCategoryDropdownOpen(false);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition"
                >
                  <SlidersHorizontal className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-800 font-medium">{activeSectionLabel}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {sectionDropdownOpen && (
                  <div className="absolute z-20 mt-2 w-72 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b bg-gray-50">
                      <p className="text-sm font-semibold text-gray-800">Chọn section</p>
                      <p className="text-xs text-gray-500">Lọc món theo section</p>
                    </div>

                    <div className="max-h-72 overflow-auto p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSection(null);
                          setSectionDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl transition ${selectedSection === null ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                          }`}
                      >
                        Tất cả section
                      </button>

                      {sections.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedSection(s.id);
                            setSectionDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl transition ${selectedSection === s.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                            }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CATEGORY */}
              <div ref={categoryDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryDropdownOpen((v) => !v);
                    setSectionDropdownOpen(false);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition"
                >
                  <Layers className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-800 font-medium">{activeCategoryLabel}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute z-20 mt-2 w-72 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b bg-gray-50">
                      <p className="text-sm font-semibold text-gray-800">Chọn category</p>
                      <p className="text-xs text-gray-500">Lọc món theo category</p>
                    </div>

                    <div className="max-h-72 overflow-auto p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(null);
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl transition ${selectedCategory === null ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50'
                          }`}
                      >
                        Tất cả category
                      </button>

                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(c.id);
                            setCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl transition ${selectedCategory === c.id ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50'
                            }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Clear */}
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              >
                Xóa lọc
              </button>
            </div>
          </div>

          {/* Active chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedSection !== null && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm">
                Section: {activeSectionLabel}
                <button
                  type="button"
                  onClick={() => setSelectedSection(null)}
                  className="hover:opacity-80"
                  title="Bỏ lọc section"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}

            {selectedCategory !== null && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm">
                Category: {activeCategoryLabel}
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="hover:opacity-80"
                  title="Bỏ lọc category"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm">
                Từ khóa: “{searchQuery}”
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="hover:opacity-80"
                  title="Bỏ từ khóa"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="h-44 bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded mt-4 w-3/4 mx-auto" />
                <div className="h-4 bg-gray-200 rounded mt-2 w-1/2 mx-auto" />
                <div className="h-10 bg-gray-200 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && foods.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center text-gray-600">
            Không có món nào phù hợp bộ lọc hiện tại.
          </div>
        )}

        {/* FOOD GRID */}
        {!loading && foods.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {foods.map((food) => (
              <div
                key={food.id}
                onClick={() => goToFoodDetail(food.id)}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition overflow-hidden cursor-pointer"
              >
                <div className="relative">
                  {food.bestSeller && (
                    <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-xs rounded-full px-3 py-1">
                      ⭐ Best Seller
                    </span>
                  )}

                  <img src={food.thumbnail} alt={food.name} className="w-full h-48 object-cover" />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                  <button
                    onClick={(e) => handleAddToCart(e, food.id, food.price)}
                    className="
                      absolute bottom-3 left-3 right-3
                      py-2.5 rounded-xl
                      bg-blue-600 text-white font-semibold
                      opacity-0 group-hover:opacity-100
                      transition
                    "
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 text-center line-clamp-1">{food.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 text-center">{food.description}</p>
                  <p className="text-center font-bold text-gray-900 mt-3">
                    {food.price.toLocaleString()} VND
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            disabled={currentPage === 1 || loading}
            onClick={goPrev}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:shadow-sm disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Trang trước
          </button>

          <span className="px-4 py-2 text-gray-700">
            <span className="font-semibold">{currentPage}</span> / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages || loading}
            onClick={goNext}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:shadow-sm disabled:opacity-50"
          >
            Trang sau
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Food;
