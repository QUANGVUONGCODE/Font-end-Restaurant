// Header.js
import React, { useState } from 'react';
import Time from './Time';

interface AboutMeProps {
    aboutImage: string;
}

const AboutMe:React.FC<AboutMeProps> = ({ aboutImage }) => {

    return (
        <section className="bg-neutral-100 py-16">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                <div
                    className="bg-neutral-900 h-80 rounded-lg bg-cover bg-center"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${aboutImage})`
                    }}
                >
                    <div className="p-8 text-white">
                        <h2 className="text-3xl mb-4">VỀ CHÚNG TÔI</h2>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl mb-4">Nghệ thuật ẩm thực kết hợp với sự hiếu khách ấm áp</h3>
                    <p className="text-neutral-600 mb-4">
                        Niềm đam mê về sự hoàn hảo trong ẩm thực của chúng tôi đã được hun đúc qua nhiều thế hệ, kết hợp kỹ thuật truyền thống với sự sáng tạo hiện đại. Mỗi món ăn được chế biến từ những nguyên liệu địa phương tươi ngon nhất.
                    </p>
                    <div className="space-y-2 text-neutral-600">
                        <p><strong>Địa chỉ:</strong> 123 Gourmet Street, Food District, City 55245</p>
                        <p><strong>Điện thoại:</strong> +1 (555) 123-4567</p>
                        <p><strong>Website:</strong> www.labellecuisine.com</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutMe;
