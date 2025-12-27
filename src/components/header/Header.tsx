import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '../../utils/navagation';
import { getUserResponseFromLocalStorage, logout } from '../../utils/user';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string | null } | null>(null);
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  const {
    goToHome,
    goToMenu,
    goToCart,
    goToLogin,
    goToIntroduction,
    goToBlog,
    goToOrderHistory,
    goToInfo
  } = useNavigation();

  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) =>
    currentPath === path ? 'text-orange-400' : '';

  const toggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const currentUser = getUserResponseFromLocalStorage();
    if (currentUser) {
      setUser({ name: currentUser.name });
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItemCount(cart.length);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    goToHome();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen((prev) => !prev);
  };

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* ===== TOP BAR ===== */}
        <div className="flex justify-between items-center">
          {/* LOGO */}
          <button onClick={goToHome}>
            <h1 className="text-2xl font-bold">Restaurant</h1>
          </button>

          {/* ===== DESKTOP MENU ===== */}
          <nav className="hidden md:flex space-x-6 items-center">
            <button
              onClick={goToHome}
              className={`hover:text-orange-400 ${isActive('/')}`}
            >
              Trang chủ
            </button>

            <button
              onClick={goToIntroduction}
              className={`hover:text-orange-400 ${isActive('/introduction')}`}
            >
              Giới thiệu
            </button>

            <button
              onClick={goToMenu}
              className={`hover:text-orange-400 ${isActive('/menu')}`}
            >
              Thực đơn
            </button>

            <button
              onClick={goToBlog}
              className={`hover:text-orange-400 ${isActive('/blog')}`}
            >
              Bài viết
            </button>

            {/* CART */}
            <div className="relative">
              <button
                onClick={goToCart}
                className={`hover:text-orange-400 ${isActive('/cart')}`}
              >
                Giỏ hàng
              </button>

              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </div>

            {/* USER */}
            {user ? (
              <div className="relative">
                <button
                  onClick={handleUserMenuToggle}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-lg shadow">
                    <button
                      onClick={goToInfo}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Trang cá nhân
                    </button>
                    <button
                      onClick={goToOrderHistory}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Lịch sử đặt bàn
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={goToLogin}
                className="bg-white text-gray-900 px-4 py-1 rounded hover:bg-orange-400 hover:text-white"
              >
                Đăng nhập
              </button>
            )}
          </nav>

          {/* ===== MOBILE BUTTON ===== */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={toggleMenu}
          >
            ☰
          </button>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 px-4 py-4 space-y-4">
          <button
            onClick={goToHome}
            className={`block w-full text-left hover:text-orange-400 ${isActive('/')}`}
          >
            Trang chủ
          </button>

          <button
            onClick={goToIntroduction}
            className={`block w-full text-left hover:text-orange-400 ${isActive('/introduction')}`}
          >
            Giới thiệu
          </button>

          <button
            onClick={goToMenu}
            className={`block w-full text-left hover:text-orange-400 ${isActive('/menu')}`}
          >
            Thực đơn
          </button>

          <button
            onClick={goToCart}
            className={`block w-full text-left hover:text-orange-400 ${isActive('/cart')}`}
          >
            Giỏ hàng
            {cartItemCount > 0 && (
              <span className="ml-2 text-xs bg-red-500 px-2 py-0.5 rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>

          <div className="border-t border-gray-700 pt-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-400 hover:text-red-500"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <button
                onClick={goToLogin}
                className="w-full bg-white text-gray-900 py-2 rounded hover:bg-orange-400 hover:text-white"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
