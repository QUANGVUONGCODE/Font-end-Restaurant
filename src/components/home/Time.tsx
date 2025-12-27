// Header.js
import React, { useState } from 'react';


const Time = () => {


    return (
        <section className="bg-neutral-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl mb-4">Giờ mở cửa</h2>
                    <p className="text-neutral-300">Chúng tôi chào đón bạn trong khung giờ sau</p>
                </div>
                <div className="max-w-md mx-auto space-y-4">
                    <div className="flex justify-between items-center p-4 bg-neutral-800 rounded-lg">
                        <span>Thứ hai - Thứ sáu</span>
                        <span className="bg-amber-600 px-4 py-2 rounded">08:00 - 22:00</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-neutral-800 rounded-lg">
                        <span>Thứ bảy</span>
                        <span className="bg-amber-600 px-4 py-2 rounded">09:00 - 22:00</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-neutral-800 rounded-lg">
                        <span>Chủ nhật</span>
                        <span className="bg-amber-600 px-4 py-2 rounded text-center">Nghỉ</span>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Time;
