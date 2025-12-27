import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import FoodCategory from './FoodCategory';

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  thumbnail: string;
  bestSeller: boolean;
  categoryId: number;
}

const IMG_BASE = 'http://localhost:8080/restaurant/api/v1/foods/images/';

const GetFoodDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [food, setFood] = useState<Food | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH FOOD ================= */
  const fetchFoodDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/restaurant/api/v1/foods/${id}`);
      const data = await res.json();

      if (data.code === 0 && data.result) {
        const f = data.result;

        const mainThumb = `${IMG_BASE}${f.thumbnail}`;
        setFood({
          id: f.id,
          name: f.name,
          description: f.description,
          price: f.price,
          thumbnail: mainThumb,
          bestSeller: f.bestSeller,
          categoryId: f.category.id,
        });

        await fetchFoodImages(f.id, mainThumb);
      } else {
        toast.error('Không tìm thấy món ăn');
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi khi tải món ăn');
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodImages = async (foodId: number, fallbackThumb: string) => {
    try {
      const res = await fetch(`http://localhost:8080/restaurant/api/v1/foods/imageFoods/${foodId}`);
      const data = await res.json();

      if (data.code === 0 && Array.isArray(data.result)) {
        const imgs = data.result
          .map((i: any) => i?.url)
          .filter(Boolean)
          .map((url: string) => `${IMG_BASE}${url}`);

        // đảm bảo có ảnh chính nằm trong list
        const merged = [fallbackThumb, ...imgs].filter(Boolean);

        // unique
        const uniq = Array.from(new Set(merged));

        setImages(uniq);
        setCurrentImage(uniq[0] || fallbackThumb);
      } else {
        setImages([fallbackThumb]);
        setCurrentImage(fallbackThumb);
      }
    } catch (e) {
      // nếu lỗi vẫn hiển thị thumbnail chính
      setImages((prev) => (prev.length ? prev : [fallbackThumb]));
      setCurrentImage((prev) => prev || fallbackThumb);
    }
  };

  useEffect(() => {
    fetchFoodDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ================= THUMBNAILS: luôn lấy đúng 5 ô ================= */
  const thumbSlots = useMemo(() => {
    const first5 = images.slice(0, 5);
    const missing = 5 - first5.length;
    return {
      thumbs: first5,
      placeholders: missing > 0 ? Array.from({ length: missing }) : [],
    };
  }, [images]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = () => {
    if (!food) return;

    const cart: [number, number][] = JSON.parse(localStorage.getItem('cart') || '[]');
    const prices: [number, number][] = JSON.parse(localStorage.getItem('productPrices') || '[]');

    const index = cart.findIndex((i) => i[0] === food.id);

    if (index !== -1) {
      cart[index][1] += quantity;
    } else {
      cart.push([food.id, quantity]);
      prices.push([food.id, food.price]);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('productPrices', JSON.stringify(prices));

    toast.success('Đã thêm vào giỏ hàng', {
      description: `${food.name} × ${quantity}`,
    });
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!food) return <div className="p-6">Không tìm thấy món ăn</div>;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button onClick={() => navigate(-1)} className="mb-5 text-blue-600 hover:text-blue-800">
          ← Quay lại thực đơn
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* ================= LEFT: GALLERY (ảnh + 5 thumbnails nằm gọn bên dưới, không nhô ra) ================= */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* MAIN IMAGE */}
            <div className="relative w-full">
              <img
                src={currentImage || food.thumbnail}
                alt={food.name}
                className="w-full aspect-square md:aspect-[4/3] object-cover"
              />

              {food.bestSeller && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-bold shadow">
                  ⭐ Best Seller
                </div>
              )}
            </div>

            {/* THUMBNAILS: luôn nằm TRONG container, responsive, đủ 5 ô */}
            <div className="p-4">
              <div className="grid grid-cols-5 gap-2 w-full">
                {thumbSlots.thumbs.map((img, idx) => {
                  const active = currentImage === img;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentImage(img)}
                      className={`w-full aspect-square rounded-xl overflow-hidden border transition ${
                        active
                          ? 'ring-2 ring-red-500 border-red-200'
                          : 'border-gray-200 hover:shadow'
                      }`}
                      aria-label={`Chọn ảnh ${idx + 1}`}
                    >
                      <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}

                {/* placeholders để luôn đủ 5 ô và không bị lệch layout */}
                {thumbSlots.placeholders.map((_, i) => (
                  <div
                    key={`ph-${i}`}
                    className="w-full aspect-square rounded-xl border border-dashed border-gray-200 bg-gray-50"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ================= RIGHT: INFO ================= */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{food.name}</h1>

            {food.description && <p className="text-gray-600 mt-3 leading-relaxed">{food.description}</p>}

            <div className="mt-5 text-2xl sm:text-3xl font-bold text-gray-900">
              {food.price.toLocaleString('vi-VN')} đ
            </div>

            {/* QUANTITY */}
            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-semibold"
              >
                −
              </button>

              <div className="min-w-12 text-center text-lg font-semibold">{quantity}</div>

              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-semibold"
              >
                +
              </button>
            </div>

            {/* ACTION */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition"
              >
                Thêm vào giỏ – {(food.price * quantity).toLocaleString('vi-VN')} đ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related by category */}
      <FoodCategory categoryId={food.categoryId} />
    </>
  );
};

export default GetFoodDetail;
