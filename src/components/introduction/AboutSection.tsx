import React from 'react';

interface AboutSectionProps {
  wineImage: string;
  foodImage: string;
  spaceImage: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  wineImage,
  foodImage,
  spaceImage,
}) => {
  return (
    <section className="bg-white">
      {/* ===== HERO IMAGE ===== */}
      <div className="w-full h-[500px] md:h-[600px] relative">
        <img
          src={wineImage}
          alt="Wine cellar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-white text-5xl md:text-7xl font-black uppercase tracking-wider">
            Giới thiệu
          </h1>
          <p className="mt-3 text-orange-400 text-lg tracking-wide">
            Hành trình hương vị & đẳng cấp
          </p>
        </div>
      </div>

      {/* ===== SECTION 1 ===== */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <div>
          <p className="text-[#C08A4D] italic mb-2">Cam kết</p>
          <h2 className="text-3xl font-semibold mb-6 tracking-wide">
            CHẤT LƯỢNG
          </h2>

          <p className="text-gray-600 leading-relaxed mb-4">
            Lấy tiêu chí “SỰ LỰA CHỌN ĐẲNG CẤP” và nụ cười hài lòng của khách hàng
            là phương châm hoạt động của chúng tôi.
          </p>

          <p className="text-gray-600 leading-relaxed">
            Chúng tôi mang tinh hoa ẩm thực cùng phong cách phục vụ chuyên nghiệp,
            tạo nên những trải nghiệm đáng nhớ cho từng thực khách.
          </p>

          <p className="mt-6 text-[#C08A4D] font-medium italic">
            Nhà hàng Sesan
          </p>
        </div>

        {/* Image */}
        <div className="flex justify-center">
          <img
            src={foodImage}
            alt="Food"
            className="rounded-xl shadow-lg max-w-md w-full"
          />
        </div>
      </div>

      {/* ===== SECTION 2 ===== */}
      <div className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Image */}
        <div className="flex justify-center md:order-1">
          <img
            src={spaceImage}
            alt="Restaurant space"
            className="rounded-xl shadow-lg w-full"
          />
        </div>

        {/* Text */}
        <div className="md:order-2">
          <p className="text-[#C08A4D] italic mb-2">Khởi nguồn</p>
          <h2 className="text-3xl font-semibold mb-6 tracking-wide">
            TỪ ĐAM MÊ
          </h2>

          <p className="text-gray-600 leading-relaxed mb-4">
            Sự ra đời của chúng tôi bắt nguồn từ niềm đam mê ẩm thực và mong muốn
            tạo ra một không gian thưởng thức tinh tế.
          </p>

          <p className="text-gray-600 leading-relaxed">
            Mỗi món ăn, mỗi góc không gian đều được chăm chút để mang lại cảm xúc
            trọn vẹn nhất cho thực khách.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
