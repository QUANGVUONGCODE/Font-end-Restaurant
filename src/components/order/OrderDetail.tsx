import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '../../utils/navagation';
import { checkAndRefreshToken } from '../../utils/TokenManager';
import { X, Loader2, CreditCard, Wallet, Ban } from 'lucide-react';

const FOOD_IMG_BASE = 'http://localhost:8080/restaurant/api/v1/foods/images/';

type ApiOrderDetailItem = {
  id: number;
  price: number;
  quantity: number;
  total_money: number;
  food: {
    id: number;
    name: string;
    price: number;
    thumbnail: string;
    description: string;
    category?: { id: number; name: string };
  };
  order: {
    id: number;
    orderCode: string;
    fullName: string;
    phoneNumber: string;
    numberOfGuest: number;
    note: string;
    orderDate: string;
    endTime?: string;
    status: string;
    totalMoney: number;
    table: { id: number; name: string; capacity: number };
    payment?: { id: number; name: string; description: string } | null;
  };
};

type ApiResponse = {
  code: number;
  result: ApiOrderDetailItem[];
};

interface OrderDetailModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged?: () => void;
}

const formatDateTimeVN = (value?: string) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('vi-VN');
};

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  orderId,
  isOpen,
  onClose,
  onStatusChanged,
}) => {
  const { goToHome } = useNavigation();
  const [items, setItems] = useState<ApiOrderDetailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState<'cash' | 'ewallet' | 'cancel' | null>(null);
  const headerInfo = useMemo(() => {
    const first = items?.[0];
    return first?.order ?? null;
  }, [items]);
  const isPending = (headerInfo?.status || '').toUpperCase() === 'PENDING';

  useEffect(() => {
    if (isOpen) fetchOrderDetails();
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    setLoading(true);
    setItems([]);
    const token = await checkAndRefreshToken();
    if (!token) {
      toast.error('❌ Bạn chưa đăng nhập!');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/restaurant/api/v1/order-details/orders/${orderId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data: ApiResponse = await res.json();
      if (data.code === 0) {
        setItems(Array.isArray(data.result) ? data.result : []);
      } else {
        toast.error('❌ Lỗi khi lấy chi tiết đơn hàng');
      }
    } catch (err) {
      console.error(err);
      toast.error('❌ Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const updateTxnRefForOrder = async (txnRef: string) => {
    const token = await checkAndRefreshToken();
    if (!token) {
      toast.error('❌ Bạn chưa đăng nhập!');
      return false;
    }

    const res = await fetch(`http://localhost:8080/restaurant/api/v1/order/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        vnp_txn_ref: txnRef, // Cập nhật txnRef mà không thay đổi status
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.code !== 0) {
      toast.error('❌ Không thể cập nhật txnRef');
      return false;
    }
    return true;
  };

  const handlePayAtRestaurant = async () => {
    if (!headerInfo) return;

    setPayLoading('cash');
    try {
      const ok = await updateOrderStatus('UNPAID');
      if (ok) {
        toast.success('✅ Đã chọn thanh toán tại nhà hàng');
        await fetchOrderDetails();
        onStatusChanged?.();
      }
    } catch (e) {
      console.error(e);
      toast.error('❌ Lỗi khi xử lý thanh toán');
    } finally {
      setPayLoading(null);
    }
  };

  const handlePayEWallet = async () => {
    if (!headerInfo) return;

    setPayLoading('ewallet');
    try {
      const token = await checkAndRefreshToken();
      if (!token) {
        toast.error('❌ Bạn chưa đăng nhập!');
        return;
      }

      const paymentRes = await fetch(
        'http://localhost:8080/restaurant/api/v1/payments/create_payment_url',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: headerInfo.totalMoney, // Dùng tổng tiền của order
            bankCode: '',
            language: 'vi',
          }),
        }
      );

      const paymentData = await paymentRes.json();

      if (paymentData?.status !== 'OK' || !paymentData?.data) {
        toast.error('❌ Không thể tạo URL thanh toán');
        return;
      }

      const txnRef = new URL(paymentData.data).searchParams.get('vnp_TxnRef');
      if (txnRef) {
        const ok = await updateTxnRefForOrder(txnRef);
        if (!ok) return;
      }

      toast.success('✅ Đang chuyển tới cổng thanh toán...');
      window.location.href = paymentData.data;
    } catch (e) {
      console.error(e);
      toast.error('❌ Lỗi khi tạo thanh toán');
    } finally {
      setPayLoading(null);
    }
  };

  const handleCancelPayment = async () => {
    const okConfirm = window.confirm('Bạn chắc chắn muốn hủy thanh toán / hủy đơn này?');
    if (!okConfirm) return;

    setPayLoading('cancel');
    try {
      const ok = await updateOrderStatus('CANCELLED');
      if (ok) {
        toast.success('✅ Đã hủy thanh toán');
        await fetchOrderDetails();
        onStatusChanged?.();
      }
    } catch (e) {
      console.error(e);
      toast.error('❌ Lỗi khi hủy thanh toán');
    } finally {
      setPayLoading(null);
    }
  };

  const updateOrderStatus = async (status: string) => {
    const token = await checkAndRefreshToken();
    if (!token) {
      toast.error('❌ Bạn chưa đăng nhập!');
      return false;
    }

    const res = await fetch(`http://localhost:8080/restaurant/api/v1/order/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.code !== 0) {
      toast.error('❌ Không thể cập nhật trạng thái đơn');
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (isOpen) fetchOrderDetails();
  }, [isOpen, orderId]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">Chi tiết đơn hàng #{orderId}</h3>
              {headerInfo?.orderCode && (
                <p className="text-white/80 text-sm">Mã: {headerInfo.orderCode}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/15 transition"
              aria-label="close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[75vh] overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-14 text-gray-600">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Đang tải chi tiết...
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-700 font-medium">Không có dữ liệu chi tiết.</p>
                <button
                  onClick={fetchOrderDetails}
                  className="mt-4 px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition"
                >
                  Tải lại
                </button>
              </div>
            ) : (
              <>
                {/* Thông tin chung */}
                {headerInfo && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500">Khách hàng</p>
                        <p className="font-semibold text-gray-900">{headerInfo.fullName}</p>
                        <p className="text-sm text-gray-600">{headerInfo.phoneNumber}</p>
                      </div>

                      <div className="p-4 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500">Bàn / Số khách</p>
                        <p className="font-semibold text-gray-900">
                          {headerInfo.table?.name} ({headerInfo.table?.capacity} chỗ)
                        </p>
                        <p className="text-sm text-gray-600">{headerInfo.numberOfGuest} khách</p>
                      </div>

                      <div className="p-4 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500">Thời gian / Trạng thái</p>
                        <p className="font-semibold text-gray-900">{formatDateTimeVN(headerInfo.orderDate)}</p>
                        <p className="text-sm text-gray-600">{headerInfo.status}</p>
                      </div>

                      <div className="p-4 rounded-xl border border-gray-100 md:col-span-2">
                        <p className="text-xs text-gray-500">Ghi chú</p>
                        <p className="text-gray-900">{headerInfo.note || 'Không có ghi chú'}</p>
                      </div>

                      <div className="p-4 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500">Tổng tiền</p>
                        <p className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                          {headerInfo.totalMoney?.toLocaleString('vi-VN')} đ
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Thanh toán: {headerInfo.payment?.name || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* ✅ CHỈ HIỆN NÚT THANH TOÁN KHI PENDING */}
                    {isPending && (
                      <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">Thanh toán</p>
                            <p className="text-sm text-gray-600">
                              Chỉ đơn <b>PENDING</b> mới cho phép chọn hình thức thanh toán.
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={handlePayAtRestaurant}
                              disabled={payLoading !== null}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:shadow transition disabled:opacity-60"
                            >
                              {payLoading === 'cash' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CreditCard className="w-4 h-4" />
                              )}
                              Tại nhà hàng
                            </button>

                            <button
                              onClick={handlePayEWallet}
                              disabled={payLoading !== null}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition disabled:opacity-60"
                            >
                              {payLoading === 'ewallet' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Wallet className="w-4 h-4" />
                              )}
                              E-Wallet
                            </button>

                            <button
                              onClick={handleCancelPayment}
                              disabled={payLoading !== null}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition disabled:opacity-60"
                            >
                              {payLoading === 'cancel' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                              Hủy thanh toán
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Danh sách món */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-900">Danh sách món</h4>
                  <span className="text-sm text-gray-500">{items.length} món</span>
                </div>

                <div className="space-y-4">
                  {items.map((it) => {
                    const thumb = it.food?.thumbnail ? `${FOOD_IMG_BASE}${it.food.thumbnail}` : '';

                    return (
                      <div
                        key={it.id}
                        className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition"
                      >
                        <div className="w-full sm:w-28 sm:h-28 h-44 overflow-hidden rounded-xl bg-gray-100">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={it.food?.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : null}
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <p className="text-lg font-semibold text-gray-900">{it.food?.name}</p>
                              <p className="text-sm text-gray-600">{it.food?.description || 'Không có mô tả'}</p>
                              {it.food?.category?.name && (
                                <p className="text-xs text-gray-500 mt-1">Danh mục: {it.food.category.name}</p>
                              )}
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-sm text-gray-500">Đơn giá</p>
                              <p className="font-semibold text-gray-900">{it.price?.toLocaleString('vi-VN')} đ</p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                              Số lượng: <span className="font-semibold text-gray-900">{it.quantity}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Thành tiền:{' '}
                              <span className="font-bold text-gray-900">{it.total_money?.toLocaleString('vi-VN')} đ</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
