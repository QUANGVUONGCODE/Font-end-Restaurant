import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../utils/navagation';
import { toast } from 'sonner';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
  description: string;
}

const CartDetail = () => {
  const { goToOrderForm, goToMenu, goToLogin } = useNavigation();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH CART ================= */
  const getCartDetails = async () => {
    const storedCart: [number, number][] = JSON.parse(
      localStorage.getItem('cart') || '[]'
    );
    const storedPrices: [number, number][] = JSON.parse(
      localStorage.getItem('productPrices') || '[]'
    );

    if (!storedCart.length) {
      toast.error('❌ Chưa có món ăn nào trong giỏ hàng', { duration: 3000 });
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const ids = storedCart.map((i) => i[0]).join(',');

      const res = await fetch(
        `http://localhost:8080/restaurant/api/v1/foods/by-ids?ids=${ids}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'vi',
          },
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();

      if (data.code === 0) {
        const cartItems: CartItem[] = storedCart
          .map(([id, qty]) => {
            const food = data.result.find((f: any) => f.id === id);
            const price = storedPrices.find((p) => p[0] === id)?.[1];
            if (!food || !price) return null;

            return {
              id,
              name: food.name,
              price,
              quantity: qty,
              thumbnail: `http://localhost:8080/restaurant/api/v1/foods/images/${food.thumbnail}`,
              description: food.description,
            };
          })
          .filter(Boolean) as CartItem[];

        setItems(cartItems);
      } else {
        setError('Không thể tải giỏ hàng');
      }
    } catch {
      setError('Có lỗi xảy ra khi tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCartDetails();
  }, []);

  /* ================= SYNC LOCALSTORAGE ================= */
  const syncLocalStorage = (updatedItems: CartItem[]) => {
    localStorage.setItem(
      'cart',
      JSON.stringify(updatedItems.map((i) => [i.id, i.quantity]))
    );
    localStorage.setItem(
      'productPrices',
      JSON.stringify(updatedItems.map((i) => [i.id, i.price]))
    );
  };

  const handleIncrease = (id: number) => {
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      );
      syncLocalStorage(updated);
      return updated;
    });
  };

  const handleDecrease = (id: number) => {
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.id === id && i.quantity > 1
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
      syncLocalStorage(updated);
      return updated;
    });
  };

  const handleRemove = (id: number) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      syncLocalStorage(updated);

      if (updated.length === 0) {
        toast.error('❌ Giỏ hàng đã trống');
      }

      return updated;
    });
  };

  /* ================= LOGIN CHECK ================= */
  const handleGoToOrder = () => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user_response');

    if (!token || !user) {
      toast.error('⚠️ Vui lòng đăng nhập để tiếp tục đặt bàn', {
        duration: 3000,
      });
      goToLogin();
      return;
    }

    goToOrderForm();
  };

  /* ================= TOTAL ================= */
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto p-6">
      <button
        onClick={goToMenu}
        className="text-blue-600 hover:text-blue-800 font-medium mb-4"
      >
        ← Quay về thực đơn
      </button>

      <h2 className="text-2xl font-bold mb-2">Giỏ hàng của bạn</h2>
      <p className="mb-6 text-gray-600">
        Bạn đang có {items.length} món trong giỏ
      </p>

      <div className="lg:flex lg:space-x-8">
        {/* ITEMS */}
        <div className="flex-1 space-y-6">
          {loading && <p>Đang tải...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading &&
            !error &&
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-xl"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-500">
                      {item.price.toLocaleString()} đ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDecrease(item.id)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleIncrease(item.id)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500 ml-2"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* SUMMARY */}
        <div className="lg:w-1/3 mt-8 lg:mt-0">
          <div className="p-6 bg-white border rounded-xl shadow">
            <div className="flex justify-between mb-4">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString()} đ</span>
            </div>

            <div className="flex justify-between mb-4">
              <span>Thuế (10%)</span>
              <span>{tax.toLocaleString()} đ</span>
            </div>

            <div className="flex justify-between text-xl font-bold border-t pt-4 mb-6">
              <span>Tổng cộng</span>
              <span className="text-red-600">
                {total.toLocaleString()} đ
              </span>
            </div>

            {items.length > 0 && (
              <button
                onClick={handleGoToOrder}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tiếp tục đặt bàn
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDetail;
