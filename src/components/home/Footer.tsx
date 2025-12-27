// Header.js
import React, { useState } from 'react';
import Time from './Time';
import AboutMe from './AboutMe';
import { useNavigation } from '../../utils/navagation';

interface FooterProps {
    heroImage: string;
}

const Footer:React.FC<FooterProps> = ({ heroImage }) => {
    const {goToCart} = useNavigation();

    return (
        <section
                className="relative h-96 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImage})` }}
            >
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center">
                    <div className="text-white">
                        <h2 className="text-4xl mb-4">Sẵn sàng thưởng thức?</h2>
                        <p className="mb-6 text-neutral-200">Đặt bàn ngay để trải nghiệm những món ăn tuyệt vời nhất</p>
                        <button
                            className="bg-white text-neutral-900 hover:bg-neutral-200 px-6 py-3 rounded-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105"
                            onClick={goToCart}
                        >
                            Bắt đầu đặt món
                        </button>
                    </div>
                </div>
            </section>
    );
};

export default Footer;
