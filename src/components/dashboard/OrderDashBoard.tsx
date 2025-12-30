import React, { useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { checkAndRefreshToken } from '../../utils/TokenManager';
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  X,
  Loader2,
  CalendarDays,
  Receipt,
  Phone,
  User,
  Table2,
  Users2,
} from 'lucide-react';

const FOOD_IMG_BASE = 'http://localhost:8080/restaurant/api/v1/foods/images/';

type OrderRow = {
  id: number;
  fullName: string;
  orderCode: string;
  phoneNumber: string;
  tableName: string;
  numberOfGuest: number;
  note: string;
  orderDate: string;
  totalMoney: number | null;
  status: string;
};

const STATUS_OPTIONS = ['PENDING', 'CANCELLED', 'COMPLETED', 'UNPAID', 'PAID'] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

const statusBadge = (status?: string) => {
  const s = (status || '').toUpperCase();
  if (s === 'COMPLETED') return 'bg-emerald-100 text-emerald-700';
  if (s === 'PAID') return 'bg-indigo-100 text-indigo-700';
  if (s === 'UNPAID') return 'bg-orange-100 text-orange-700';
  if (s === 'PENDING') return 'bg-amber-100 text-amber-800';
  if (s === 'CANCELLED') return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-700';
};

const formatMoney = (n?: number | null) => {
  if (n === null || n === undefined) return '—';
  return `${Number(n).toLocaleString('vi-VN')} VNĐ`;
};

const OrderDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // edit modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // detail modal (orderDetails2)
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [orderDetails2, setOrderDetails2] = useState<any | null>(null);

  const fetchOrders = async () => {
    const token = await checkAndRefreshToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/restaurant/api/v1/order?keyword=${encodeURIComponent(searchQuery)}&page=${page}&limit=${limit}`,
        { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();

      if (data.code === 0) {
        const mapped: OrderRow[] = (data?.result?.orders || []).map((order: any) => ({
          id: order.id,
          fullName: order?.user?.fullName ?? order?.user?.full_name ?? '',
          orderCode: order?.order_code ?? order?.orderCode ?? '',
          phoneNumber: order?.user?.phoneNumber ?? order?.user?.phone_number ?? '',
          tableName: order?.table?.name ?? '',
          numberOfGuest: order?.number_of_guest ?? order?.numberOfGuest ?? 0,
          note: order?.note ?? '',
          orderDate: order?.order_date ?? order?.orderDate ?? '',
          totalMoney: order?.total_money ?? order?.totalMoney ?? null,
          status: order?.status ?? '',
        }));
        setOrders(mapped);
      } else {
        toast.error('Không tải được danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Lỗi khi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersToday = async () => {
    const token = await checkAndRefreshToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/restaurant/api/v1/order/today', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.code === 0 && Array.isArray(data.result)) {
        if (data.result.length === 0) {
          toast.info('Hôm nay chưa có đơn nào');
          setOrders([]);
        } else {
          const mapped: OrderRow[] = data.result.map((order: any) => ({
            id: order.id,
            fullName: order?.user?.fullName ?? order?.user?.full_name ?? '',
            orderCode: order?.order_code ?? order?.orderCode ?? '',
            phoneNumber: order?.user?.phoneNumber ?? order?.user?.phone_number ?? '',
            tableName: order?.table?.name ?? '',
            numberOfGuest: order?.number_of_guest ?? order?.numberOfGuest ?? 0,
            note: order?.note ?? '',
            orderDate: order?.order_date ?? order?.orderDate ?? '',
            totalMoney: order?.total_money ?? order?.totalMoney ?? null,
            status: order?.status ?? '',
          }));
          setOrders(mapped);
          setPage(0);
        }
      } else {
        toast.error('Dữ liệu đơn hôm nay không hợp lệ');
      }
    } catch (error) {
      console.error('Error fetching orders today:', error);
      toast.error('Lỗi khi tải đơn hôm nay');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (id: number) => {
    const token = await checkAndRefreshToken();
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/restaurant/api/v1/order/${id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.code === 0) {
        setSelectedOrder(data.result);
        setModalOpen(true);
      } else {
        toast.error('Không tải được chi tiết đơn (edit)');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Lỗi khi tải chi tiết đơn');
    }
  };

  const fetchOrderDetails2 = async (orderId: number) => {
    const token = await checkAndRefreshToken();
    if (!token) return;

    setDetailLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/restaurant/api/v1/order-details/orders/${orderId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.code === 0 && Array.isArray(data.result) && data.result.length > 0) {
        const o = data.result[0]?.order || {};

        const orderDetail = {
          orderCode: o.orderCode ?? o.order_code ?? '',
          fullName: o?.user?.fullName ?? o?.user?.full_name ?? '',
          phoneNumber: o?.user?.phoneNumber ?? o?.user?.phone_number ?? '',
          numberOfGuest: o.numberOfGuest ?? o.number_of_guest ?? 0,
          tableName: o?.table?.name ?? '',
          orderDate: o.orderDate ?? o.order_date ?? '',
          totalMoney: o.totalMoney ?? o.total_money ?? null,
          status: o.status ?? '',
          note: o.note ?? '',
          foodDetails: data.result.map((item: any) => ({
            foodName: item?.food?.name ?? '',
            quantity: item?.quantity ?? 0,
            price: item?.price ?? 0,
            total: item?.total_money ?? (item?.price ?? 0) * (item?.quantity ?? 0),
            thumbnail: item?.food?.thumbnail ? `${FOOD_IMG_BASE}${item.food.thumbnail}` : null,
            description: item?.food?.description ?? '',
          })),
        };

        setOrderDetails2(orderDetail);
        setDetailOpen(true);
      } else {
        toast.error('Không tải được chi tiết đơn');
      }
    } catch (error) {
      console.error('Error fetching order details 2:', error);
      toast.error('Lỗi khi tải chi tiết đơn');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    const token = await checkAndRefreshToken();
    if (!token) return;

    const ok = window.confirm('Bạn chắc chắn muốn xóa đơn này?');
    if (!ok) return;

    try {
      const response = await fetch(`http://localhost:8080/restaurant/api/v1/order/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.code === 0) {
        toast.success('✅ Đã xóa đơn');
        fetchOrders();
      } else {
        toast.error('❌ Xóa thất bại');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Lỗi khi xóa đơn');
    }
  };

  // ✅ Update status bằng API: PUT /order/{id} body { status }
  const handleUpdateStatus = async (id: number, status: StatusOption) => {
    const token = await checkAndRefreshToken();
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/restaurant/api/v1/order/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.code === 0) {
        toast.success(`✅ Đã đổi trạng thái: ${status}`);
        setDropdownOpen(null);
        fetchOrders();
      } else {
        toast.error('❌ Đổi trạng thái thất bại');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Lỗi khi đổi trạng thái');
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    const token = await checkAndRefreshToken();
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch(`http://localhost:8080/restaurant/api/v1/order/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedOrder),
      });
      const data = await response.json();
      if (data.code === 0) {
        toast.success('✅ Cập nhật đơn thành công');
        setModalOpen(false);
        fetchOrders();
      } else {
        toast.error('❌ Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Lỗi khi cập nhật đơn');
    } finally {
      setSaving(false);
    }
  };

  const handleDropdownToggle = (orderId: number) => {
    setDropdownOpen((prev) => (prev === orderId ? null : orderId));
  };

  const closeEditModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const closeDetailModal = () => {
    setDetailOpen(false);
    setOrderDetails2(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setSelectedOrder({ ...selectedOrder, [field]: e.target.value });
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchQuery]);

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {Array.from({ length: 11 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded" />
        </td>
      ))}
    </tr>
  );

  const countTotal = useMemo(() => orders.length, [orders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 md:p-8 ml-64">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Danh sách đặt bàn</h2>
            <p className="text-sm text-gray-600">Tìm kiếm, xem chi tiết, đổi trạng thái & chỉnh sửa đơn</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm text-gray-700">
              Tổng: <b>{countTotal}</b> — Trang: <b>{page + 1}</b>
            </div>

            <button
              onClick={fetchOrdersToday}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
              disabled={loading}
            >
              <CalendarDays className="w-4 h-4" />
              Đơn hôm nay
            </button>
          </div>
        </div>

        {/* Search + Controls */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-gray-500" />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => {
                  setPage(0);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Tìm theo tên / SĐT / mã order..."
                className="w-full outline-none text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={limit}
                onChange={(e) => {
                  setPage(0);
                  setLimit(Number(e.target.value));
                }}
                className="px-4 py-2.5 border rounded-xl border-gray-200 bg-white outline-none"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}/trang
                  </option>
                ))}
              </select>

              <button
                onClick={fetchOrders}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                disabled={loading}
              >
                {loading ? 'Đang tải...' : 'Tải lại'}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-teal-400 text-white flex items-center justify-between">
            <span className="font-semibold">Danh sách đơn</span>
            <span className="text-sm text-white/90">{loading ? 'Đang tải...' : `${orders.length} đơn`}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full table-auto">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-center w-20">ID</th>
                  <th className="px-4 py-3 text-left">Người đặt</th>
                  <th className="px-4 py-3 text-center">SĐT</th>
                  <th className="px-4 py-3 text-center">Order Code</th>
                  <th className="px-4 py-3 text-center">Bàn</th>
                  <th className="px-4 py-3 text-center">Số người</th>
                  <th className="px-4 py-3 text-left">Ghi chú / Món</th>
                  <th className="px-4 py-3 text-center">Giờ đặt</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center w-20">...</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-10 text-center text-gray-600">
                      Không có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-center font-medium text-gray-900">{order.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{order.fullName}</div>
                        <div className="text-xs text-gray-500">
                          Bàn: {order.tableName} • {order.numberOfGuest} khách
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-800">{order.phoneNumber}</td>
                      <td className="px-4 py-3 text-center font-medium text-gray-900">{order.orderCode}</td>
                      <td className="px-4 py-3 text-center">{order.tableName}</td>
                      <td className="px-4 py-3 text-center">{order.numberOfGuest}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-800 line-clamp-2">{order.note || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">{order.orderDate}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatMoney(order.totalMoney)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadge(order.status)}`}>
                          {order.status || '—'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="relative inline-block text-left">
                          <button
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                            onClick={() => handleDropdownToggle(order.id)}
                            title="Hành động"
                          >
                            <MoreHorizontal className="w-5 h-5 text-gray-700" />
                          </button>

                          {dropdownOpen === order.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-20">
                              <button
                                onClick={() => {
                                  setDropdownOpen(null);
                                  fetchOrderDetails(order.id);
                                }}
                                className="w-full px-4 py-2.5 text-left text-gray-800 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Pencil className="w-4 h-4" /> Chỉnh sửa
                              </button>

                              <button
                                onClick={() => {
                                  setDropdownOpen(null);
                                  fetchOrderDetails2(order.id);
                                }}
                                className="w-full px-4 py-2.5 text-left text-gray-800 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" /> Xem chi tiết
                              </button>

                              {/* ✅ STATUS PICKER */}
                              <div className="px-2 py-2 border-t border-gray-100">
                                <div className="px-2 pb-2 text-xs font-semibold text-gray-500">Đổi trạng thái</div>
                                <div className="grid grid-cols-1 gap-1">
                                  {STATUS_OPTIONS.map((st) => (
                                    <button
                                      key={st}
                                      onClick={() => handleUpdateStatus(order.id, st)}
                                      className={`w-full px-3 py-2 rounded-lg text-left text-sm transition ${
                                        (order.status || '').toUpperCase() === st
                                          ? 'bg-blue-50 text-blue-700'
                                          : 'text-gray-800 hover:bg-gray-50'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setDropdownOpen(null);
                                  handleDeleteOrder(order.id);
                                }}
                                className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                              >
                                <Trash2 className="w-4 h-4" /> Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination (chỉ page, không cần totalPages) */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:shadow transition disabled:opacity-50"
            disabled={page === 0 || loading}
          >
            Trang trước
          </button>

          <div className="text-sm text-gray-700">
            Trang <span className="font-semibold">{page + 1}</span>
          </div>

          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:shadow transition disabled:opacity-50"
            disabled={loading}
          >
            Trang sau
          </button>
        </div>
      </div>

      {/* Modal Edit */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/45" onClick={closeEditModal} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="font-semibold">Chỉnh sửa đơn #{selectedOrder.id}</div>
                <button onClick={closeEditModal} className="p-2 rounded-lg hover:bg-white/15 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Tên người đặt</label>
                  <input
                    type="text"
                    value={selectedOrder.full_name || selectedOrder.fullName || ''}
                    onChange={(e) => handleChange(e, 'fullName')}
                    className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Nhập tên..."
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Số điện thoại</label>
                  <input
                    type="text"
                    value={selectedOrder.phone_number || selectedOrder.phoneNumber || ''}
                    onChange={(e) => handleChange(e, 'phoneNumber')}
                    className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Nhập SĐT..."
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Số người</label>
                  <input
                    type="number"
                    value={selectedOrder.number_of_guest || selectedOrder.numberOfGuest || ''}
                    onChange={(e) => handleChange(e, 'numberOfGuest')}
                    className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Ghi chú</label>
                  <input
                    type="text"
                    value={selectedOrder.note || ''}
                    onChange={(e) => handleChange(e, 'note')}
                    className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Ghi chú..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={closeEditModal}
                    className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                    disabled={saving}
                  >
                    Hủy
                  </button>

                  <button
                    onClick={handleUpdateOrder}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg transition disabled:opacity-60"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang lưu...
                      </span>
                    ) : (
                      'Lưu'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail (invoice style) */}
      {detailOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/45" onClick={closeDetailModal} />

          {/* wrapper: luôn có padding + cuộn nếu màn hình thấp */}
          <div className="absolute inset-0 p-3 sm:p-4 md:p-6 overflow-y-auto">
            <div className="mx-auto w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-teal-500 text-white">
                <div className="flex items-center gap-2 font-semibold">
                  <Receipt className="w-5 h-5" />
                  Chi tiết đơn hàng
                </div>
                <button onClick={closeDetailModal} className="p-2 rounded-lg hover:bg-white/15 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* body: giới hạn chiều cao và cho scroll nội bộ */}
              <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
                {detailLoading || !orderDetails2 ? (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tải chi tiết...
                  </div>
                ) : (
                  <>
                    {/* Top info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-gray-50 border rounded-2xl p-4">
                        <div className="text-xs text-gray-500">Mã đơn</div>
                        <div className="font-semibold text-gray-900 break-words">{orderDetails2.orderCode || '—'}</div>
                        <div className="mt-2 inline-flex">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadge(orderDetails2.status)}`}>
                            {orderDetails2.status || '—'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 border rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-gray-800">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium break-words">{orderDetails2.fullName || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-800">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="break-words">{orderDetails2.phoneNumber || '—'}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 border rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-gray-800">
                          <Table2 className="w-4 h-4 text-gray-500" />
                          <span>
                            Bàn: <b>{orderDetails2.tableName || '—'}</b>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-800">
                          <Users2 className="w-4 h-4 text-gray-500" />
                          <span>
                            Số khách: <b>{orderDetails2.numberOfGuest ?? '—'}</b>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-800">
                          <CalendarDays className="w-4 h-4 text-gray-500" />
                          <span className="break-words">{orderDetails2.orderDate || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Note + total */}
                    <div className="mt-4 sm:mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                      <div className="md:col-span-2 bg-white border rounded-2xl p-4">
                        <div className="text-xs text-gray-500">Ghi chú</div>
                        <div className="text-gray-900 mt-1 break-words">{orderDetails2.note || 'Không có ghi chú'}</div>
                      </div>
                      <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl p-4">
                        <div className="text-xs text-white/90">Tổng tiền</div>
                        <div className="text-2xl font-bold mt-1">{formatMoney(orderDetails2.totalMoney)}</div>
                      </div>
                    </div>

                    {/* Foods list */}
                    <div className="mt-5 sm:mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Danh sách món</h4>

                      <div className="space-y-3">
                        {orderDetails2.foodDetails?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="grid grid-cols-1 sm:grid-cols-[80px,1fr,140px] gap-3 sm:gap-4 bg-gray-50 border rounded-2xl p-4"
                          >
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border flex items-center justify-center">
                              {item.thumbnail ? (
                                <img src={item.thumbnail} alt={item.foodName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-xs text-gray-400">No image</div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 break-words">{item.foodName || '—'}</div>
                              <div className="text-sm text-gray-600 line-clamp-2">{item.description || 'Không có mô tả'}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Giá: {formatMoney(item.price)} • SL: {item.quantity}
                              </div>
                            </div>

                            <div className="text-left sm:text-right">
                              <div className="text-xs text-gray-500">Thành tiền</div>
                              <div className="font-bold text-gray-900">{formatMoney((item.price || 0) * (item.quantity || 0))}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default OrderDashboardPage;
