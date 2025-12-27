import React from 'react';
import { useNavigation } from '../../utils/navagation';

interface SliderProps {
  sliderImage: string;
}

const Slider: React.FC<SliderProps> = ({ sliderImage }) => {
  const { goToMenu, goToCart } = useNavigation();

  return (
    <section className="relative h-[500px] sm:h-[600px] md:h-[700px] overflow-hidden">
      {/* Background image */}
      <img
        src={sliderImage}
        alt="Slider background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center">
        <div className="text-white max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl mb-6 font-bold">
            Trải nghiệm ẩm thực tuyệt vời
          </h1>

          <p className="mb-8 text-neutral-200 text-lg sm:text-xl">
            Hương vị tinh tế từ những nguyên liệu tươi ngon nhất, kết hợp cùng
            không gian sang trọng và phục vụ tận tâm.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={goToMenu}
              className="border-white text-white hover:bg-white hover:text-neutral-900 px-6 py-3 rounded-lg text-lg font-semibold border-2 transition duration-300"
            >
              Xem thực đơn
            </button>

            <button
              className="border-white text-white hover:bg-white hover:text-neutral-900 px-6 py-3 rounded-lg text-lg font-semibold border-2 transition duration-300"
              onClick={goToCart}
            >
              Đặt bàn ngay
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Slider;
