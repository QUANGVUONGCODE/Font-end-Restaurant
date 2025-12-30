import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getUserId } from '../../utils/user';
import { checkAndRefreshToken } from '../../utils/TokenManager';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  StickyNote,
  Utensils,
  Package,
  ShoppingBag,
} from 'lucide-react';
import OrderDetailModal from './OrderDetail';
import { useNavigation } from '../../utils/navagation';

interface Order {
  id: number;
  order_code: string;
  full_name: string;
  email: string;
  phone_number: string;
  number_of_guest: number;
  table: {
    id: number;
    name: string;
    capacity: number;
  };
  note: string;
  order_date: string;
  total_money: number;
  status: string;
  payment: {
    id: number;
    name: string;
    description: string;
  } | null;
}

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all'); // Trạng thái lọc đơn hàng
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const {goToMenu} = useNavigation();
  useEffect(() => {
    const fetchOrderHistory = async () => {
      const userId = getUserId();
      const token = await checkAndRefreshToken();

      if (!userId || !token) {
        toast.error('❌ Bạn chưa đăng nhập!');
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/restaurant/api/v1/order/user/${userId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.code === 0) {
          setOrders(data.result);
        } else {
          toast.error('❌ Lỗi khi lấy lịch sử đơn hàng');
        }
      } catch (error) {
        console.error('Error fetching order history:', error);
        toast.error('❌ Lỗi kết nối');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  // Hàm lấy màu và icon cho từng trạng thái đơn hàng
  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();

    if (statusLower.includes('pending')) {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        icon: <Clock className="w-4 h-4" />,
        label: 'Đang xử lý',
      };
    } else if (statusLower.includes('completed') || statusLower.includes('paid')) {
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        icon: <CheckCircle2 className="w-4 h-4" />,
        label: 'Hoàn thành',
      };
    } else if (statusLower.includes('cancelled')) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Đã hủy',
      };
    } else {
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
        icon: <Package className="w-4 h-4" />,
        label: status,
      };
    }
  };

  // Skeleton Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-12 bg-gray-200 rounded-lg w-64 mx-auto mb-8 animate-pulse"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Lọc đơn hàng theo trạng thái
  const filteredOrders =
    filter === 'all'
      ? orders
      : filter === 'completed' // Nếu filter là 'completed', ta phải lọc cả 'PAID' và 'completed'
        ? orders.filter(
          (order) =>
            order.status.toLowerCase().includes('completed') ||
            order.status.toLowerCase().includes('paid')
        )
        : orders.filter((order) =>
          order.status.toLowerCase().includes(filter.toLowerCase())
        );


  const handleViewDetails = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true); // Open modal when "Xem chi tiết" is clicked
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close modal when "X" is clicked
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Lịch sử đơn hàng</h1>
          <p className="text-gray-600">Quản lý và theo dõi tất cả đơn hàng của bạn</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {['all', 'pending', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${filter === status
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                }`}
            >
              {status === 'all'
                ? '📋 Tất cả'
                : status === 'pending'
                  ? '⏳ Đang xử lý'
                  : status === 'completed'
                    ? '✅ Hoàn thành'
                    : '❌ Đã hủy'}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-gray-600 mb-8">Bạn chưa có đơn hàng nào trong danh sách này</p>
            <button 
              onClick={goToMenu} 
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Đặt món ngay
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {filteredOrders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <div
                  key={order.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Header Card */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                          <Utensils className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-100 mb-1">Mã đơn hàng</p>
                          <h3 className="text-xl font-bold">#{order.order_code || 'N/A'}</h3>
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.border} border-2`}
                      >
                        <span className={statusConfig.text}>{statusConfig.icon}</span>
                        <span className={`font-semibold ${statusConfig.text}`}>{statusConfig.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6"> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Thông tin khách hàng */} <div className="space-y-4"> <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2 mb-4"> <Users className="w-5 h-5 text-blue-500" /> Thông tin khách hàng </h4> <div className="space-y-3"> <div className="flex items-start gap-3 text-sm"> <Users className="w-4 h-4 text-gray-400 mt-0.5" /> <div> <p className="text-gray-500 text-xs">Họ tên</p> <p className="text-gray-900 font-medium"> {order.full_name} </p> </div> </div> <div className="flex items-start gap-3 text-sm"> <Mail className="w-4 h-4 text-gray-400 mt-0.5" /> <div> <p className="text-gray-500 text-xs">Email</p> <p className="text-gray-900 font-medium break-all"> {order.email} </p> </div> </div> <div className="flex items-start gap-3 text-sm"> <Phone className="w-4 h-4 text-gray-400 mt-0.5" /> <div> <p className="text-gray-500 text-xs"> Số điện thoại </p> <p className="text-gray-900 font-medium"> {order.phone_number} </p> </div> </div> </div> </div> {/* Thông tin đặt bàn */} <div className="space-y-4"> <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2 mb-4"> <Utensils className="w-5 h-5 text-purple-500" /> Thông tin đặt bàn </h4> <div className="space-y-3"> <div className="flex items-start gap-3 text-sm"> <Utensils className="w-4 h-4 text-gray-400 mt-0.5" /> <div> <p className="text-gray-500 text-xs">Bàn</p> <p className="text-gray-900 font-medium"> {order.table.name} <span className="text-gray-500 ml-1"> ({order.table.capacity} chỗ) </span> </p> </div> </div> <div className="flex items-start gap-3 text-sm"> <Users className="w-4 h-4 text-gray-400 mt-0.5" /> <div> <p className="text-gray-500 text-xs">Số người</p> <p className="text-gray-900 font-medium"> {order.number_of_guest} người </p> </div> </div> {order.note && (<div className="flex items-start gap-3 text-sm"> <StickyNote className="w-4 h-4 text-gray-400 mt-0.5" /> <div> <p className="text-gray-500 text-xs">Ghi chú</p> <p className="text-gray-900 font-medium"> {order.note} </p> </div> </div>)} </div> </div> {/* Thông tin thanh toán */} <div className="space-y-4"> <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2 mb-4"> <CreditCard className="w-5 h-5 text-green-500" /> Thanh toán </h4> <div className="space-y-3"> <div className="flex items-start gap-3 text-sm"> <Calendar className="w-4 h-4 text-gray-400 mt-0.5" /> <div> <p className="text-gray-500 text-xs">Ngày đặt</p> <p className="text-gray-900 font-medium"> {order.order_date ? new Date(order.order_date).toLocaleString('vi-VN') : 'Chưa có ngày đặt'} </p> </div> </div> <div className="flex items-start gap-3 text-sm"> <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" /> <div> <p className="text-gray-500 text-xs"> Phương thức </p> <p className="text-gray-900 font-medium"> {order.payment ? order.payment.name : 'Chưa thanh toán'} </p> </div> </div> <div className="flex items-start gap-3 text-sm"> <div className="w-4 h-4 mt-0.5 text-gray-400"> 💰 </div> <div> <p className="text-gray-500 text-xs">Tổng tiền</p> <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> {order.total_money !== null ? order.total_money.toLocaleString('vi-VN') : '0'}{' '} đ </p> </div> </div> </div> </div> </div> </div> {/* Footer Card */} <div className="bg-gray-50 px-6 py-4 border-t border-gray-100"> <div className="flex flex-col sm:flex-row justify-between items-center gap-3"> <p className="text-sm text-gray-600"> Đơn hàng #{order.id} • Đặt lúc{' '} {order.order_date ? new Date(order.order_date).toLocaleString('vi-VN') : 'N/A'} </p> <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105" onClick={() => handleViewDetails(order.id)}> Xem chi tiết </button> </div> </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isModalOpen}
        orderId={selectedOrderId !}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default OrderHistoryPage;
