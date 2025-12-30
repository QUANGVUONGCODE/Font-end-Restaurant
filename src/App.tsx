import React from 'react';
import './App.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

import HomePage from './pages/Home';
import MenuPage from './pages/Menu';
import FoodDetailPage from './pages/FoodDetail';
import CartDetailPage from './pages/Cart';
import Order from './pages/Order';
import Loggin from './pages/Loggin';
import Register from './pages/Register';
import Introduction from './pages/Introduction';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import PaymentCallback from './components/order/PaymentCallBack';
import OrderHistory from './pages/OrderHistory';
import Dashboard from './pages/admin/Dashboard';
import Sidebar from './components/dashboard/SideBarPage';
import BlogDashboard from './pages/admin/BlogDashBoard';
import CategoryDashboardPage from './components/dashboard/CategoiresDashboard';
import FoodDashboardPage from './components/dashboard/FoodDashboard';
import PostFoodPage from './components/dashboard/PostFoodPage';
import PostBlogPage from './components/dashboard/PostBlogPage';
import TableDashboardPage from './components/dashboard/TableDashBoard';
import OrderDashboardPage from './components/dashboard/OrderDashBoard';
import CommentSection from './components/dashboard/CommentDashboard';
import UserList from './components/dashboard/UserDashBoard';
import UserInfoPage from './loggin/Infor';
import Profile from './pages/Profile';
import SectionDashboardPage from './components/dashboard/SectionsDashboard';


// Wrapper animation cho từng page
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Các route không có sidebar cho User */}
        <Route
          path="/"
          element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          }
        />
        <Route
          path="/menu"
          element={
            <PageTransition>
              <MenuPage />
            </PageTransition>
          }
        />
        <Route
          path="/menu/:id"
          element={
            <PageTransition>
              <FoodDetailPage />
            </PageTransition>
          }
        />
        <Route
          path="/cart"
          element={
            <PageTransition>
              <CartDetailPage />
            </PageTransition>
          }
        />

        <Route
          path="/info"
          element={
            <PageTransition>
              <Profile />
            </PageTransition>
          }
        />
        
        <Route
          path="/order"
          element={
            <PageTransition>
              <Order />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <Loggin />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />
        <Route
          path="/introduction"
          element={
            <PageTransition>
              <Introduction />
            </PageTransition>
          }
        />
        <Route
          path="/blog"
          element={
            <PageTransition>
              <Blog />
            </PageTransition>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <PageTransition>
              <BlogDetail />
            </PageTransition>
          }
        />
        <Route
          path="/payments/payment-callback"
          element={
            <PageTransition>
              <PaymentCallback />
            </PageTransition>
          }
        />
        <Route
          path="/order-history"
          element={
            <PageTransition>
              <OrderHistory />
            </PageTransition>
          }
        />

        {/* Các route có sidebar cho Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <PageTransition>
              <Sidebar />
              <Dashboard />
            </PageTransition>
          }
        />
        <Route
          path="/admin/blog"
          element={
            <PageTransition>
              <Sidebar />
              <BlogDashboard />
            </PageTransition>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <PageTransition>
              <Sidebar />
              <CategoryDashboardPage />
            </PageTransition>
          }
        />
        <Route
          path="/admin/foods"
          element={
            <PageTransition>
              <Sidebar />
              <FoodDashboardPage />
            </PageTransition>
          }
        />
        <Route
          path="/admin/foods/add"
          element={
            <PageTransition>
              <Sidebar />
              <PostFoodPage />
            </PageTransition>
          }
        />
        <Route
          path='/admin/blog/add'
          element={
            <PageTransition>
              <Sidebar />
              <PostBlogPage />
            </PageTransition>
          }
        />
        <Route
          path="/admin/tables"
          element={
            <PageTransition>
              <Sidebar />
              <TableDashboardPage />
            </PageTransition>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <PageTransition>
              <Sidebar />
              <OrderDashboardPage />
            </PageTransition>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <PageTransition>
              <Sidebar />
              <CommentSection />
            </PageTransition>
          }
        />

        <Route
          path="/admin/users"
          element={
            <PageTransition>
              <Sidebar />
              <UserList />
            </PageTransition>
          }
        />
        <Route
          path='/admin/sections'
          element={
            <PageTransition>
              <Sidebar />
              <SectionDashboardPage />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton duration={2500} />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
