import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../utils/navagation';
import { toast } from 'sonner';

const Food = () => {
  const [foods, setFoods] = useState<{
    id: number;
    name: string;
    description: string;
    price: number;
    thumbnail: string;
    bestSeller: boolean;
  }[]>([]);

  const [sections, setSections] = useState<{ id: number; name: string }[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);
  const [limit] = useState(12);

  const { goToFoodDetail } = useNavigation();

  /* ================= FETCH SECTIONS ================= */
  const fetchSections = async () => {
    try {
      const res = await fetch(
        'http://localhost:8080/restaurant/api/v1/sections'
      );
      const data = await res.json();
      if (data.code === 0) setSections(data.result);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FETCH FOODS ================= */
  const fetchFoods = async (
    sectionId: number | null = null,
    page: number = 1,
    keyword = ''
  ) => {
    try {
      const res = await fetch(
        `http://localhost:8080/restaurant/api/v1/foods?limit=${limit}&page=${page - 1}&keyword=${keyword}&category_id=&section_id=${sectionId || ''}`
      );
      const data = await res.json();
      if (data.code === 0) {
        setFoods(
          data.result.foodResponseList.map((food: any) => ({
            id: food.id,
            name: food.name,
            price: food.price,
            bestSeller: food.bestSeller,
            description: food.description,
            thumbnail: `http://localhost:8080/restaurant/api/v1/foods/images/${food.thumbnail}`,
          }))
        );
        setTotalPages(data.result.totalPages);
        setCurrentPage(page); // ✅ Cập nhật currentPage
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchFoods();
  }, []);

  /* ================= HANDLERS ================= */
  const handleAddToCart = (
    e: React.MouseEvent,
    foodId: number,
    price: number
  ) => {
    e.stopPropagation();

    const cart: [number, number][] = JSON.parse(
      localStorage.getItem('cart') || '[]'
    );
    const prices: [number, number][] = JSON.parse(
      localStorage.getItem('productPrices') || '[]'
    );

    const index = cart.findIndex((i) => i[0] === foodId);

    if (index !== -1) {
      cart[index][1] += 1;
    } else {
      cart.push([foodId, 1]);
      prices.push([foodId, price]);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('productPrices', JSON.stringify(prices));

    toast.success('Đã thêm vào giỏ hàng');
  };

  /* ================= UI ================= */
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-semibold text-center mb-6">Thực Đơn</h1>

      {/* SEARCH */}
      <div className="flex justify-center mb-6">
        <input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            fetchFoods(selectedSection, 1, e.target.value); // Reset về trang 1
          }}
          placeholder="Tìm món ăn..."
          className="px-6 py-2 rounded-full border w-80"
        />
      </div>

      {/* SECTIONS */}
      <div className="text-center mb-6">
        <button
          onClick={() => {
            setSelectedSection(null);
            fetchFoods(null, 1, searchTerm); // Reset về trang 1
          }}
          className={`px-6 py-2 mr-3 rounded-full border ${
            selectedSection === null
              ? 'bg-blue-500 text-white'
              : 'bg-white text-blue-500'
          }`}
        >
          Tất cả
        </button>

        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSelectedSection(s.id);
              fetchFoods(s.id, 1, searchTerm); // Reset về trang 1
            }}
            className={`px-6 py-2 mr-3 rounded-full border ${
              selectedSection === s.id
                ? 'bg-blue-500 text-white'
                : 'bg-white text-blue-500'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* FOOD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {foods.map((food) => (
          <div
            key={food.id}
            onClick={() => goToFoodDetail(food.id)}
            className="group bg-white p-4 rounded-xl shadow hover:shadow-2xl transition relative cursor-pointer"
          >
            {food.bestSeller && (
              <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs rounded-full px-3 py-1">
                Best Seller
              </span>
            )}

            <img
              src={food.thumbnail}
              alt={food.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />

            <h3 className="text-lg font-semibold text-center mb-2">
              {food.name}
            </h3>

            <p className="text-center font-bold mb-4">
              {food.price.toLocaleString()} VND
            </p>

            {/* ADD TO CART (HOVER ONLY) */}
            <button
              onClick={(e) => handleAddToCart(e, food.id, food.price)}
              className="
                mt-5
                absolute bottom-4 left-4 right-4
                py-2 bg-blue-600 text-white rounded-lg
                opacity-0 group-hover:opacity-100
                transition duration-300
              "
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center mt-8">
        <button
          disabled={currentPage === 1}
          onClick={() => {
            const prevPage = currentPage - 1;
            fetchFoods(selectedSection, prevPage, searchTerm); // ✅ Dùng currentPage
          }}
          className="px-4 py-2 mx-2 text-blue-500 disabled:text-gray-400"
        >
          Trang trước
        </button>
        <span className="px-4 py-2">
          {currentPage}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => {
            const nextPage = currentPage + 1;
            fetchFoods(selectedSection, nextPage, searchTerm); // ✅ Dùng currentPage
          }}
          className="px-4 py-2 mx-2 text-blue-500 disabled:text-gray-400"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
};

export default Food;
