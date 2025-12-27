import React, { useState } from 'react';
import { toast } from 'sonner';
import { login } from '../utils/user';
import { useNavigation } from '../utils/navagation';


interface FooterProps {
    heroImage: string;
}

const LoginPage:React.FC<FooterProps> = ({ heroImage })=> {
  const [phoneNumber, setPhoneNumber] = useState(''); // Đổi thành phoneNumber
  const [password, setPassword] = useState('');
  const { goToHome, goToRegister, goToDashboard } = useNavigation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !password) {
      toast.error('❌ Vui lòng điền đầy đủ thông tin.');
      return;
    }

    try {
      const response = await login(phoneNumber, password);
      const role = localStorage.getItem('user_role');  // Lấy vai trò từ localStorage

      if (response.code === 0) {
        if (role === 'ROLE_ADMIN') {
          toast.success('✅ Đăng nhập thành công!');
          goToDashboard();  // Điều hướng đến trang admin
        } else {
          toast.success('✅ Đăng nhập thành công!');
          goToHome();  // Điều hướng về trang chủ
        }
      } else {
        toast.error('❌ Thông tin đăng nhập không chính xác!');
      }
    } catch (error) {
      toast.error('❌ Đăng nhập thất bại, vui lòng thử lại!');
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-gray-100"
      style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >

      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Đăng nhập</h2>
        <form onSubmit={handleLogin}>
          {/* Số điện thoại input */}
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input
              id="phoneNumber"
              type="tel" // Định dạng số điện thoại
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Số điện thoại"
              required
            />
          </div>

          {/* Mật khẩu input */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Đăng nhập Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
          >
            Đăng nhập
          </button>
        </form>

        {/* Link đăng ký */}
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <a onClick={goToRegister} className="text-blue-600 hover:underline cursor-pointer">
              Đăng ký ngay
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
