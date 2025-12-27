import React, { useEffect, useState } from 'react';
import { useNavigation } from '../../utils/navagation';
import { toast } from 'sonner';
import { checkTokenValidity } from '../../utils/user';
import { checkAndRefreshToken } from '../../utils/TokenManager';


/* ================== INTERFACES ================== */
interface Table {
  id: number;
  name: string;
  seats: number;
  status: 'AVAILABLE' | 'BOOKED' | 'PROCESSING';
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

interface Payment {
  id: number;
  name: string;
  description: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  notes: string;
}

/* ================== COMPONENT ================== */
const Reservation = () => {
  const { goToCart, goToHome } = useNavigation();

  const [tables, setTables] = useState<Table[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [paymentId, setPaymentId] = useState<number>(2);
  const [loadingTables, setLoadingTables] = useState(false);
  const [txnRef, setTxnRef] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    date: '',
    startTime: '',
    endTime: '',
    numberOfPeople: 2,
    notes: '',
  });

  /* ================== LOAD USER ================== */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user_response') || '{}');
    if (user?.id) {
      setCustomerInfo((prev) => ({
        ...prev,
        name: user.full_name || '',
        phone: user.phone_number || '',
        email: user.email || '',
      }));
    }
  }, []);

  /* ================== INIT ================== */
  useEffect(() => {
    fetchPayments();
    fetchCartItems();
  }, []);

  /* ================== FETCH TABLES BY TIME ================== */
  useEffect(() => {
    if (customerInfo.date && customerInfo.startTime && customerInfo.endTime) {
      const start = `${customerInfo.date}T${customerInfo.startTime}:00`;
      const end = `${customerInfo.date}T${customerInfo.endTime}:00`;
      fetchTables(start, end);
    }
  }, [customerInfo.date, customerInfo.startTime, customerInfo.endTime]);

  const fetchTables = async (startTime?: string, endTime?: string) => {
    setLoadingTables(true);
    try {
      const query =
        startTime && endTime ? `?startTime=${startTime}&endTime=${endTime}` : '';

      const res = await fetch(
        `http://localhost:8080/restaurant/api/v1/tables${query}`,
        { headers: { 'Accept-Language': 'vi' } }
      );

      const data = await res.json();
      if (data.code === 0) {
        const mapped: Table[] = data.result.map((t: any) => ({
          id: t.id,
          name: t.table_name,
          seats: t.capacity,
          status: t.table_status,
        }));

        setTables(mapped);

        if (
          selectedTableId &&
          !mapped.some(
            (t) => t.id === selectedTableId && t.status === 'AVAILABLE'
          )
        ) {
          setSelectedTableId(null);
          toast.error('❌ Bàn đã không còn trống trong khung giờ này');
        }
      }
    } catch {
      toast.error('❌ Không thể kiểm tra bàn trống');
    } finally {
      setLoadingTables(false);
    }
  };

  /* ================== PAYMENTS ================== */
  const fetchPayments = async () => {
    const res = await fetch(
      'http://localhost:8080/restaurant/api/v1/payments'
    );
    const data = await res.json();
    if (data.code === 0) setPayments(data.result);
  };

  /* ================== CART ================== */
  const fetchCartItems = async () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.length) {
      toast.error('❌ Giỏ hàng đang trống');
      return;
    }

    const ids = cart.map((i: [number, number]) => i[0]).join(',');
    const res = await fetch(
      `http://localhost:8080/restaurant/api/v1/foods/by-ids?ids=${ids}`
    );
    const data = await res.json();

    if (data.code === 0) {
      const items = cart.map(([id, qty]: [number, number]) => {
        const food = data.result.find((f: any) => f.id === id);
        return {
          id,
          name: food.name,
          price: food.price,
          quantity: qty,
          thumbnail: `http://localhost:8080/restaurant/api/v1/foods/images/${food.thumbnail}`,
        };
      });
      setCartItems(items);
    }
  };

  /* ================== TOTAL ================== */
  const subtotal = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  /* ================== INPUT ================== */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  /* ================== SUBMIT ================== */
  const handleSubmit = async () => {
    if (!selectedTableId) {
      toast.error('❌ Vui lòng chọn bàn');
      return;
    }

    if (!customerInfo.date || !customerInfo.startTime || !customerInfo.endTime) {
      toast.error('❌ Vui lòng chọn đầy đủ ngày và giờ');
      return;
    }

    if (!cartItems.length) {
      toast.error('❌ Giỏ hàng đang trống');
      return;
    }

    if (paymentId !== 1 && paymentId !== 3) {
      toast.error('❌ Phương thức thanh toán không hợp lệ. Vui lòng chọn phương thức thanh toán.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user_response') || '{}');
    const token = await checkAndRefreshToken();
    if (!token || !(await checkTokenValidity(token))) {
      toast.error('❌ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      setTimeout(() => {
        window.location.href = '/login'; // Chuyển hướng về trang đăng nhập
      }, 2000);
      return;
    }

    if (!user?.id || !token) {
      toast.error('❌ Vui lòng đăng nhập');
      return;
    }

    const payload = {
      vnp_txn_ref: txnRef,
      user_id: user.id,
      full_name: customerInfo.name,
      email: customerInfo.email,
      phone_number: customerInfo.phone,
      note: customerInfo.notes,
      number_of_guest: customerInfo.numberOfPeople,
      table_id: selectedTableId,
      payment_id: paymentId,
      order_date: `${customerInfo.date}T${customerInfo.startTime}:00`,
      end_time: `${customerInfo.date}T${customerInfo.endTime}:00`,
      cart_items: cartItems.map((i) => ({
        food_id: i.id,
        quantity: i.quantity,
      })),
    };

    try {
      if (paymentId === 1) {
        const orderRes = await fetch('http://localhost:8080/restaurant/api/v1/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...payload,
            vnp_txn_ref: 'DIRECT_PAYMENT'
          }),
        });
        if (orderRes.ok) {
          // Chuyển khoản ngân hàng, sẽ xử lý thanh toán thành công và quay về trang chủ
          toast.success('✅ Đặt bàn thành công.');
          localStorage.removeItem('cart'); // Xóa giỏ hàng sau khi đặt bàn thành công
          setTimeout(() => {
            goToHome(); // Quay về trang chủ sau khi thành công
          }, 2000);
        }
      } else if (paymentId === 3) {
        // Momo hoặc VNPay, gọi API thanh toán
        const paymentRes = await fetch('http://localhost:8080/restaurant/api/v1/payments/create_payment_url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: total,  // Tổng số tiền cần thanh toán
            bankCode: '',   // Không gửi bankCode ngay lập tức
            language: 'vi', // Ngôn ngữ giao diện
          }),
        });

        const paymentData = await paymentRes.json();

        if (paymentData.status === 'OK') {
          const txnRef = new URL(paymentData.data).searchParams.get('vnp_TxnRef');
          // Tiến hành tạo đơn hàng và lưu vnp_TxnRef vào đơn hàng
          const orderRes = await fetch('http://localhost:8080/restaurant/api/v1/order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...payload,
              vnp_txn_ref: txnRef
            }),
          });

          if (orderRes.ok) {
            // Chuyển hướng người dùng đến URL thanh toán
            window.location.href = paymentData.data; // Chuyển hướng người dùng tới URL thanh toán
          } else {
            toast.error('❌ Lỗi khi tạo đơn hàng');
          }
        } else {
          toast.error('❌ Không thể tạo URL thanh toán');
        }
      }
    } catch (error) {
      toast.error('❌ Lỗi hệ thống');
    }
  };

  /* ================== UI ================== */
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      <button
        onClick={goToCart}
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Quay về giỏ hàng
      </button>

      {/* TABLES */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Chọn bàn theo thời gian</h2>
        {loadingTables && (
          <p className="text-sm text-gray-500">Đang kiểm tra bàn trống…</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {tables.map((t) => (
            <div
              key={t.id}
              onClick={() =>
                t.status === 'AVAILABLE' && setSelectedTableId(t.id)
              }
              className={`p-5 rounded-xl border text-center
                ${selectedTableId === t.id ? 'border-red-500 ring-2 ring-red-200' : ''}`}
            >
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-gray-500">{t.seats} chỗ</p>
              <span className="text-xs">{t.status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FORM */}
        <div className="md:col-span-2 bg-white p-8 rounded-xl shadow space-y-5">
          <h3 className="text-xl font-semibold">Thông tin đặt bàn</h3>

          {/* Họ tên */}
          <input
            name="name"
            value={customerInfo.name}
            onChange={handleInputChange}
            className="input-ui w-full"
            placeholder="Họ và tên"
          />

          {/* Số điện thoại */}
          <input
            name="phone"
            value={customerInfo.phone}
            onChange={handleInputChange}
            className="input-ui w-full"
            placeholder="Số điện thoại"
          />

          {/* Email */}
          <input
            name="email"
            value={customerInfo.email}
            onChange={handleInputChange}
            className="input-ui w-full"
            placeholder="Email"
          />

          {/* Ngày đặt */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Ngày đặt</label>
            <input
              type="date"
              name="date"
              value={customerInfo.date}
              onChange={handleInputChange}
              className="input-ui w-full"
              min={new Date().toISOString().split("T")[0]} // Set min date là ngày hôm nay
            />
          </div>

          {/* Giờ bắt đầu */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Giờ bắt đầu</label>
            <input
              type="time"
              name="startTime"
              value={customerInfo.startTime}
              onChange={handleInputChange}
              className="input-ui w-full"
            />
          </div>

          {/* Giờ kết thúc */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Giờ kết thúc</label>
            <input
              type="time"
              name="endTime"
              value={customerInfo.endTime}
              onChange={handleInputChange}
              className="input-ui w-full"
            />
          </div>

          {/* Số người */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Số người</label>
            <select
              name="numberOfPeople"
              value={customerInfo.numberOfPeople}
              onChange={handleInputChange}
              className="input-ui w-full"
            >
              {[2, 4, 6, 8, 10].map((n) => (
                <option key={n} value={n}>
                  {n} người
                </option>
              ))}
            </select>
          </div>

          {/* Phương thức thanh toán */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Phương thức thanh toán
            </label>
            <select
              value={paymentId}
              onChange={(e) => setPaymentId(Number(e.target.value))}
              className="input-ui w-full"
            >
              {payments.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} – {p.description}
                </option>
              ))}
            </select>
          </div>

          {/* Ghi chú */}
          <textarea
            name="notes"
            value={customerInfo.notes}
            onChange={handleInputChange}
            className="input-ui w-full"
            rows={3}
            placeholder="Ghi chú đặc biệt..."
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-lg"
          >
            Xác nhận đặt bàn
          </button>
        </div>

        {/* CART */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h3 className="text-xl font-semibold">Giỏ món ăn</h3>

          {cartItems.map(item => (
            <div key={item.id} className="flex gap-4 border-b pb-3">
              <img src={item.thumbnail} className="w-16 h-16 rounded object-cover" />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">x{item.quantity}</p>
              </div>
              <p className="font-semibold">{(item.price * item.quantity).toLocaleString()} đ</p>
            </div>
          ))}

          <div className="pt-2 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between">
              <span>Thuế (10%)</span>
              <span>{tax.toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng</span>
              <span>{total.toLocaleString()} đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservation;
