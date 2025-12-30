import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard'); // State to track the current active item
  const [isFoodsDropdownOpen, setIsFoodsDropdownOpen] = useState(false); // Food dropdown state
  const [isBlogDropdownOpen, setIsBlogDropdownOpen] = useState(false); // Blog dropdown state

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle set active item
  const handleSetActiveItem = (item: string) => {
    setActiveItem(item);
  };

  const toggleFoodsDropdown = () => {
    setIsFoodsDropdownOpen(!isFoodsDropdownOpen);
  };

  const toggleBlogDropdown = () => {
    setIsBlogDropdownOpen(!isBlogDropdownOpen);
  };

  return (
    <div className="w-64 bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-200 text-gray-800 h-screen fixed">
      <div className="flex justify-center mt-6 mb-8">
        <h1 className="text-2xl font-semibold text-gray-700">Restaurant</h1>
      </div>
      <ul>
        <li
          onClick={() => handleSetActiveItem('dashboard')}
          className={`p-4 rounded-lg transition duration-300 cursor-pointer ${activeItem === 'dashboard' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
        >
          <Link to="/admin/dashboard" className="text-sm font-medium">Dashboard</Link>
        </li>

        {/* Danh mục dropdown */}
        <li className={`p-4 rounded-lg transition duration-300 cursor-pointer ${activeItem === 'categories' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}>
          <div 
            className="flex justify-between items-center text-sm font-medium"
            onClick={() => handleSetActiveItem('categories')}
          >
            <Link to="/admin/categories" className="text-sm font-medium">Danh mục</Link>
          </div>
        </li>

        <li className={`p-4 rounded-lg transition duration-300 cursor-pointer ${activeItem === 'sections' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}>
          <div 
            className="flex justify-between items-center text-sm font-medium"
            onClick={() => handleSetActiveItem('sections')}
          >
            <Link to="/admin/sections" className="text-sm font-medium">Thành phần</Link>
          </div>
        </li>

        {/* Thực đơn dropdown */}
        <li
          onClick={toggleFoodsDropdown}
          className={`p-4 rounded-lg transition duration-300 cursor-pointer ${activeItem === 'foods' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
        >
          <div className="flex justify-between items-center text-sm font-medium">
            <Link to="/admin/foods" className="text-sm font-medium">Thực đơn</Link>
            <span>{isFoodsDropdownOpen ? '▲' : '▼'}</span> {/* Unicode arrow for dropdown */}
          </div>
        </li>
        
        {/* Dropdown for food items */}
        {isFoodsDropdownOpen && (
          <ul className="pl-4">
            <li
              onClick={() => handleSetActiveItem('addFood')}
              className={`p-2 rounded-lg transition duration-300 cursor-pointer ${activeItem === 'addFood' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
            >
              <Link to="/admin/foods/add" className="text-sm font-medium">Thêm thức ăn</Link>
            </li>
            <li
              onClick={() => handleSetActiveItem('manageFoods')}
              className={`p-2 rounded-lg transition duration-300 cursor-pointer ${activeItem === 'manageFoods' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
            >
              <Link to="/admin/foods" className="text-sm font-medium">Quản lý thức ăn</Link>
            </li>
          </ul>
        )}

        {/* Bài Viết dropdown */}
        <li
          onClick={toggleBlogDropdown}
          className={`p-4 rounded-lg transition duration-300 cursor-pointer ${activeItem === 'blog' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
        >
          <div className="flex justify-between items-center text-sm font-medium">
            <Link to="/admin/blog" className="text-sm font-medium">Bài Viết</Link>
            <span>{isBlogDropdownOpen ? '▲' : '▼'}</span> 
          </div>
        </li>

        {/* Dropdown for blog items */}
        {isBlogDropdownOpen && (
          <ul className="pl-4">
            <li
              onClick={() => handleSetActiveItem('addBlog')}
              className={`p-2 rounded-lg transition duration-300 cursor-pointer ${activeItem === 'addBlog' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
            >
              <Link to="/admin/blog/add" className="text-sm font-medium">Thêm bài viết</Link>
            </li>
            <li
              onClick={() => handleSetActiveItem('manageBlog')}
              className={`p-2 rounded-lg transition duration-300 cursor-pointer ${activeItem === 'manageBlog' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
            >
              <Link to="/admin/blog" className="text-sm font-medium">Quản lý bài viết</Link>
            </li>
          </ul>
        )}

        <li
          onClick={() => handleSetActiveItem('tables')}
          className={`p-4 rounded-lg transition duration-300 cursor-pointer ${activeItem === 'tables' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
        >
          <Link to="/admin/tables" className="text-sm font-medium">Quản lý bàn</Link>
        </li>

        <li
          onClick={() => handleSetActiveItem('users')}
          className={`p-4 rounded-lg transition duration-300 cursor-pointer ${activeItem === 'users' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
        >
          <Link to="/admin/users" className="text-sm font-medium">Người dùng</Link>
        </li>

        <li
          onClick={() => handleSetActiveItem('sales')}
          className={`p-4 rounded-lg transition duration-300 cursor-pointer ${activeItem === 'sales' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
        >
          <Link to="/admin/orders" className="text-sm font-medium">Đơn hàng</Link>
        </li>

        <li
          onClick={() => handleSetActiveItem('messages')}
          className={`p-4 rounded-lg transition duration-300 cursor-pointer ${activeItem === 'messages' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
        >
          <Link to="/admin/messages" className="text-sm font-medium">Bình luận</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
