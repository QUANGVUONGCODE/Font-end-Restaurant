import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cartService } from '../cart/CartService';
import { useNavigation } from '../../utils/navagation';
import { ShoppingCart, Star } from 'lucide-react';

const FoodPage = () => {
  const [foods, setFoods] = useState<
    {
      id: number;
      name: string;
      description: string;
      price: number;
      thumbnail: string;
      bestSeller: boolean;
    }[]
  >([]);

  const [page, setPage] = useState<number>(0);
  const [limit] = useState<number>(5);

  const { goToMenu , goToFoodDetail} = useNavigation();

  const fetchFoods = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/restaurant/api/v1/foods?limit=${limit}&page=${page}&keyword=&category_id=&section_id=`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'vi',
            Origin: 'http://localhost:3000',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 0 && data.result) {
        const activeFoods = data.result.foodResponseList.filter(
          (food: any) => food.active === true || food.active === 1
        );
        setFoods(
          activeFoods.map(
            (food: {
              id: number;
              name: string;
              price: number;
              bestSeller: boolean;
              thumbnail: string;
              description: string;
            }) => ({
              id: food.id,
              name: food.name,
              price: food.price,
              bestSeller: food.bestSeller,
              description: food.description,
              thumbnail: `http://localhost:8080/restaurant/api/v1/foods/images/${food.thumbnail}`,
            })
          )
        );
      } else {
        setFoods([]);
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      setFoods([]);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [page]);

  const handleAddToCart = (foodId: number, quantity: number, price: number) => {
    cartService.addToCart(foodId, quantity, price);
    toast.success('Sản phẩm đã được thêm vào giỏ hàng!');
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <Star className="w-4 h-4" />
              Được yêu thích
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
              Món ăn đặc trưng
            </h1>
            <p className="text-neutral-600 mt-2 max-w-2xl">
              Món ăn ngon và mộc mạc, đặc trưng, được chế biến từ nguyên liệu tươi
              và niềm đam mê của chúng tôi.
            </p>
          </div>

          {/* CTA View all */}
          <button
            onClick={goToMenu}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 hover:shadow-sm hover:border-blue-200 transition"
          >
            Xem toàn bộ thực đơn →
          </button>
        </div>

        {/* GRID */}
        {foods.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center text-gray-600">
            Hiện chưa có món ăn để hiển thị.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {foods.map((food) => (
              <div
                key={food.id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition overflow-hidden cursor-pointer"
                onClick={() => goToFoodDetail(food.id)}
              >
                {/* IMAGE */}
                <div className="relative">
                  {food.bestSeller && (
                    <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-xs font-semibold rounded-full px-3 py-1 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" />
                      Best Seller
                    </span>
                  )}

                  <img
                    src={food.thumbnail || 'default_image.jpg'}
                    alt={food.name}
                    className="w-full h-44 object-cover transition duration-500 group-hover:scale-[1.03]"
                  />

                  {/* overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />

                  {/* Add to cart (overlay button) */}
                  <button
                    onClick={() => handleAddToCart(food.id, 1, food.price)}
                    className="
                      absolute bottom-3 left-3 right-3
                      inline-flex items-center justify-center gap-2
                      py-2.5 rounded-xl
                      bg-blue-600 text-white font-semibold
                      opacity-0 translate-y-2
                      group-hover:opacity-100 group-hover:translate-y-0
                      transition
                    "
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Thêm vào giỏ hàng
                  </button>
                </div>

                {/* INFO */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 text-center line-clamp-1">
                    {food.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-2 text-center line-clamp-2 min-h-[40px]">
                    {food.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-gray-900 font-bold">
                      {Number(food.price).toLocaleString('vi-VN')} VND
                    </span>

                    {/* small action (mobile friendly) */}
                    <button
                      onClick={() => handleAddToCart(food.id, 1, food.price)}
                      className="sm:hidden px-3 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition"
                    >
                      + Giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Optional: nếu bạn muốn có next/prev cho page (bạn đang có state page), mình giữ sẵn */}
        {/* 
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition"
          >
            ← Trước
          </button>
          <span className="text-sm text-gray-600">Trang {page + 1}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition"
          >
            Sau →
          </button>
        </div>
        */}
      </div>
    </div>
  );
};

export default FoodPage;
