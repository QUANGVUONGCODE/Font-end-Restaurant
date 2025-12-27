import React, { useState } from 'react';

const HeaderDashboard = ()  => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_response');
    // Redirect to login page or home page
    window.location.href = '/login';
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-4 flex justify-between items-center shadow-lg mb-10 rounded-lg">
      {/* Left section */}
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold text-white">Welcome Admin</h1>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-6">
        {/* User info and dropdown */}
        <div className="relative">
          <div className="flex items-center space-x-2 text-white cursor-pointer" onClick={toggleDropdown}>
            {/* Circle around Admin */}
            <div className="w-10 h-10 bg-blue-800 rounded-full flex justify-center items-center">
              <span className="text-xl font-bold ">Admin</span> {/* You can replace this with a profile image */}
            </div>
          </div>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg">
              <ul>
                <li className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer" onClick={handleLogout}>
                  Đăng xuất
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderDashboard;
