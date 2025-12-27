// src/pages/MainDashboardPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { checkAndRefreshToken } from '../../utils/TokenManager';
import HeaderDashboard from './HeaderDasboard';
import {
  Wallet,
  CalendarDays,
  TrendingUp,
  Layers3,
  UtensilsCrossed,
  Newspaper,
  Table2,
  RefreshCcw,
  Loader2,
} from 'lucide-react';

type ApiResponse<T> = { code: number; result: T };

const MainDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [categoriesCount, setCategoriesCount] = useState(0);
  const [foodsCount, setFoodsCount] = useState(0);
  const [blogCount, setBlogCount] = useState(0);
  const [tablesCount, setTablesCount] = useState(0);

  const formatCurrency = (amount: number) =>
    `${(amount ?? 0).toLocaleString('vi-VN')} VNĐ`;

  // helper fetch JSON with token
  const fetchWithToken = async <T,>(url: string) => {
    const token = await checkAndRefreshToken();
    if (!token) throw new Error('NO_TOKEN');

    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'vi',
        Authorization: `Bearer ${token}`,
      },
    });

    const data: ApiResponse<T> = await res.json();
    return data;
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      // 1) counts
      const [
        categoriesRes,
        foodsRes,
        blogRes,
        tablesRes,
        dailyRes,
        monthlyRes,
        totalRes,
      ] = await Promise.all([
        fetchWithToken<number>('http://localhost:8080/restaurant/api/v1/categories/count'),
        fetchWithToken<number>('http://localhost:8080/restaurant/api/v1/foods/count'),
        fetchWithToken<number>('http://localhost:8080/restaurant/api/v1/blog/count'),
        fetchWithToken<number>('http://localhost:8080/restaurant/api/v1/tables/count'),
        fetchWithToken<{ totalMoney: number }>('http://localhost:8080/restaurant/api/v1/order/total-revenue-day'),
        // Nếu API month/year bắt buộc: bạn truyền month/year thật. Còn nếu backend tự hiểu current month thì để trống như bạn.
        fetchWithToken<{ totalMoney: number }>('http://localhost:8080/restaurant/api/v1/order/total-revenue?month=&year='),
        fetchWithToken<number>('http://localhost:8080/restaurant/api/v1/order/totalToNow'),
      ]);

      if (categoriesRes.code === 0) setCategoriesCount(categoriesRes.result);
      if (foodsRes.code === 0) setFoodsCount(foodsRes.result);
      if (blogRes.code === 0) setBlogCount(blogRes.result);
      if (tablesRes.code === 0) setTablesCount(tablesRes.result);

      if (dailyRes.code === 0) setDailyRevenue(dailyRes.result?.totalMoney ?? 0);
      if (monthlyRes.code === 0) setMonthlyRevenue(monthlyRes.result?.totalMoney ?? 0);
      if (totalRes.code === 0) setTotalRevenue(totalRes.result ?? 0);
    } catch (err) {
      console.error('Dashboard load error:', err);
      // bạn có thể toast ở đây nếu muốn (sonner/react-toastify)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const cards = useMemo(
    () => [
      {
        title: 'Tổng doanh thu',
        value: formatCurrency(totalRevenue),
        icon: <Wallet className="w-5 h-5" />,
        accent: 'from-blue-500 to-purple-600',
        sub: 'Tính từ trước đến nay',
      },
      {
        title: 'Doanh thu hôm nay',
        value: formatCurrency(dailyRevenue),
        icon: <CalendarDays className="w-5 h-5" />,
        accent: 'from-emerald-500 to-teal-600',
        sub: 'Chỉ tính đơn đã thanh toán',
      },
      {
        title: 'Doanh thu tháng này',
        value: formatCurrency(monthlyRevenue),
        icon: <TrendingUp className="w-5 h-5" />,
        accent: 'from-fuchsia-500 to-pink-600',
        sub: 'Theo tháng hiện tại',
      },
      {
        title: 'Tổng danh mục',
        value: `${categoriesCount}`,
        icon: <Layers3 className="w-5 h-5" />,
        accent: 'from-amber-500 to-orange-600',
        sub: 'Số category đang có',
      },
      {
        title: 'Tổng món ăn',
        value: `${foodsCount}`,
        icon: <UtensilsCrossed className="w-5 h-5" />,
        accent: 'from-indigo-500 to-blue-600',
        sub: 'Số food trong hệ thống',
      },
      {
        title: 'Tổng bài viết',
        value: `${blogCount}`,
        icon: <Newspaper className="w-5 h-5" />,
        accent: 'from-slate-600 to-gray-800',
        sub: 'Blog/News đã đăng',
      },
      {
        title: 'Tổng bàn',
        value: `${tablesCount}`,
        icon: <Table2 className="w-5 h-5" />,
        accent: 'from-rose-500 to-red-600',
        sub: 'Bàn trong nhà hàng',
      },
    ],
    [totalRevenue, dailyRevenue, monthlyRevenue, categoriesCount, foodsCount, blogCount, tablesCount]
  );

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 w-full">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-8 w-52 bg-gray-200 rounded" />
          <div className="h-3 w-64 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar bạn đang để ml-64 rồi => đảm bảo sidebar đã render ở layout khác */}
      <div className="flex-1 p-6 md:p-8 ml-64">
        <HeaderDashboard />

        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-6 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h2>
            <p className="text-gray-600 text-sm">
              Theo dõi doanh thu & số lượng dữ liệu trong nhà hàng
            </p>
          </div>

          <button
            onClick={loadAll}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            Làm mới
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : cards.map((c, idx) => (
                <div
                  key={idx}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition overflow-hidden"
                >
                  <div className={`h-1 bg-gradient-to-r ${c.accent}`} />

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-600">{c.title}</p>
                        <p className="text-2xl font-extrabold text-gray-900 mt-1">
                          {c.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">{c.sub}</p>
                      </div>

                      <div className={`shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br ${c.accent} text-white flex items-center justify-center shadow`}>
                        {c.icon}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default MainDashboardPage;
