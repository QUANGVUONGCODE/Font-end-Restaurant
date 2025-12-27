import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../utils/navagation';
import { toast } from 'sonner';

interface FoodCategoryProps {
  categoryId: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  thumbnail: string;
  bestSeller: boolean;
  categoryId: number;
}

const FoodCategory = ({ categoryId }: FoodCategoryProps) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [page] = useState<number>(0);
  const [limit] = useState<number>(4);
  const { goToMenu, goToFoodDetail } = useNavigation();

  /* ================= FETCH FOODS ================= */
  const fetchFoods = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/restaurant/api/v1/foods?limit=${limit}&page=${page}&keyword=&category_id=${categoryId}&section_id=`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'vi',
          },
        }
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
            categoryId: food.category.id,
            thumbnail: `http://localhost:8080/restaurant/api/v1/foods/images/${food.thumbnail}`,
          }))
        );
      }
    } catch (err) {
      console.error(err);
      setFoods([]);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [categoryId]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = (
    e: React.MouseEvent,
    foodId: number,
    price: number
  ) => {
    e.stopPropagation(); // ❗ quan trọng

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

    toast.success('Đã thêm món vào giỏ hàng');
  };

  /* ================= UI ================= */
  return (
    <div className="container mx-auto py-10">
      <h2 className="text-3xl font-bold mb-3">Món ăn cùng danh mục</h2>
      <p className="text-neutral-600 mb-8">
        Những món ăn tương tự mà bạn có thể yêu thích
      </p>

      {/* FOOD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {foods.map((food) => (
          <div
            key={food.id}
            onClick={() => goToFoodDetail(food.id)}
            className="group bg-white p-4 rounded-xl shadow hover:shadow-xl transition cursor-pointer relative"
          >
            {/* BADGE */}
            {food.bestSeller && (
              <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs rounded-full px-3 py-1">
                Best Seller
              </span>
            )}

            {/* IMAGE */}
            <img
              src={food.thumbnail}
              alt={food.name}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />

            {/* INFO */}
            <h3 className="text-lg font-semibold text-center mb-1">
              {food.name}
            </h3>

            <p className="text-sm text-gray-500 text-center mb-3 line-clamp-2">
              {food.description}
            </p>

            <p className="text-center font-bold mb-10">
              {food.price.toLocaleString()} VND
            </p>

            {/* ADD TO CART (HOVER ONLY) */}
            <button
              onClick={(e) => handleAddToCart(e, food.id, food.price)}
              className="
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

      {/* VIEW ALL */}
      <div className="text-right mt-8">
        <button
          onClick={goToMenu}
          className="text-neutral-600 hover:text-neutral-900 font-medium"
        >
          Xem tất cả →
        </button>
      </div>
    </div>
  );
};

export default FoodCategory;
