import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';  // Đảm bảo bạn đã import 'toast' từ 'sonner'
import { cartService } from '../cart/CartService';
import { useNavigation } from '../../utils/navagation';

const FoodPage = () => {
  const [foods, setFoods] = useState<{
    id: number;
    name: string;
    description: string;
    price: number;
    thumbnail: string;
    bestSeller: boolean;
  }[]>([]);
  const [page, setPage] = useState<number>(0);
  const [limit] = useState<number>(4);
  const {goToMenu}= useNavigation();

  const fetchFoods = async () => {
    try {
      const response = await fetch(`http://localhost:8080/restaurant/api/v1/foods?limit=${limit}&page=${page}&keyword=&category_id=&section_id=`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": "vi",
          "Origin": "http://localhost:3000",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.code === 0 && data.result) {
        setFoods(
          data.result.foodResponseList.map((food: { id: number, name: string, price: number, bestSeller: boolean, thumbnail: string, description: string }) => ({
            id: food.id,
            name: food.name,
            price: food.price,
            bestSeller: food.bestSeller,
            description: food.description,
            thumbnail: `http://localhost:8080/restaurant/api/v1/foods/images/${food.thumbnail}`,
          }))
        );
      } else {
        setFoods([]);
      }
    } catch (error) {
      console.error("Error fetching foods:", error);
      setFoods([]);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [page]);

  const handleAddToCart = (foodId: number, quantity: number, price: number) => {
    cartService.addToCart(foodId, quantity, price); // Thêm sản phẩm vào giỏ hàng
    toast.success('Sản phẩm đã được thêm vào giỏ hàng!'); // Hiển thị thông báo thành công
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-4 text-gray-900">Món ăn đặc trưng</h1>
      <p className="text-neutral-600 text-center mb-8">
        Món ăn ngon và mộc mạc, đặc trưng, ​​được chế biến từ nguyên liệu và niềm đam mê của chúng tôi.
      </p>

      {/* Hiển thị các món ăn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {foods.map((food) => (
          <div key={food.id} className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 relative group">
            {/* Best Seller Badge */}
            {food.bestSeller && (
              <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-semibold rounded-full py-1 px-3">
                Best Seller
              </span>
            )}
            {/* Image */}
            <img
              src={food.thumbnail || 'default_image.jpg'}
              alt={food.name}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            {/* Food Name */}
            <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">{food.name}</h3>
            {/* Food Description */}
            <p className="text-gray-600 mb-4 text-center">{food.description}</p>
            <div className="flex justify-between">
              {/* Price */}
              <span className="text-xl font-bold text-gray-900 mb-2">{food.price} VND</span>
            </div>
            {/* Add to Cart Button */}
            <button
              onClick={() => handleAddToCart(food.id, 1, food.price)} // Gọi hàm thêm vào giỏ hàng
              className="px-4 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 w-full mt-4"
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        ))}
      </div>

      {/* Pagination Button (View all) */}
      <div className="text-right mt-8">
        <button
          onClick={goToMenu}
          className="text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          View all →
        </button>
      </div>
    </div>
  );
};

export default FoodPage;
