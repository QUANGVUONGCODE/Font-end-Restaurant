import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useNavigation } from '../../utils/navagation';
import { checkAndRefreshToken } from '../../utils/TokenManager';

/* ================== COMPONENT ================== */
const PaymentCallback = () => {
    const { goToHome } = useNavigation();  // Đảm bảo bạn có hàm chuyển hướng về home
    const location = useLocation();
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
    const [orderInfo, setOrderInfo] = useState<any>(null); // Lưu thông tin đơn hàng


    // Lấy các tham số từ query string của URL
    const queryParams = new URLSearchParams(location.search);
    const txnRef = queryParams.get('vnp_TxnRef');
    const amount = queryParams.get('vnp_Amount');
    const responseCode = queryParams.get('vnp_ResponseCode');
    const orderInfoParam = queryParams.get('vnp_OrderInfo');  // Lấy thông tin đơn hàng từ vnp_OrderInfo


    // Xử lý callback khi có tham số từ URL
    useEffect(() => {
        if (txnRef && amount && responseCode) {
            handlePaymentCallback(txnRef, amount, responseCode);
        } else {
            toast.error('❌ Thiếu thông tin thanh toán');
        }
    }, [txnRef, amount, responseCode]);

    // Lấy OrderId từ vnp_OrderInfo (số sau '%3A')
    const extractOrderId = (orderInfo: string | null) => {
        const match = orderInfo?.match(/Thanh\+toan\+don\+hang%3A(\d+)/);
        return match ? match[1] : null;
    };

    // Xử lý kết quả thanh toán
    const handlePaymentCallback = (txnRef: string, amount: string, responseCode: string) => {
        if (responseCode === '00') {
            setPaymentStatus('Thanh toán thành công!');
            toast.success('✅ Thanh toán thành công.');

            // Lấy orderId từ orderInfoParam
            const orderId = extractOrderId(orderInfoParam);
            if (orderId) {
                setOrderInfo({ orderId }); // Lưu thông tin orderId
            } else {
                toast.error('❌ Không thể lấy thông tin đơn hàng');
            }

            
            callPaymentResultAPI(txnRef);
        } else {
            setPaymentStatus('Thanh toán thất bại.');
            toast.error('❌ Thanh toán không thành công.');
        }
    };

    // Hàm gọi API callback để xử lý thanh toán và xóa giỏ hàng
    const callPaymentResultAPI = async (txnRef: string) => {
        const token = await checkAndRefreshToken();
        try {
            const res = await fetch(`http://localhost:8080/restaurant/api/v1/payments/result/${txnRef}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            debugger;

            if (data.code === 0) {
                toast.success('✅ Kết quả thanh toán đã được xử lý thành công.');

                // Sau khi xử lý xong, xóa giỏ hàng
                localStorage.removeItem('cart');

                // Đợi một chút rồi chuyển hướng về trang chủ
                setTimeout(() => {
                    goToHome();
                }, 2000); // Chờ 2 giây trước khi chuyển hướng
            } else {
                toast.error('❌ Xử lý kết quả thanh toán thất bại.');
            }
        } catch (error) {
            toast.error('❌ Có lỗi xảy ra khi xử lý kết quả thanh toán.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div>
                <h2>{paymentStatus}</h2>
                {/* Hiển thị thông tin đơn hàng nếu có */}
                {orderInfo && (
                    <div>
                        <h3>Thông tin đơn hàng:</h3>
                        <pre>{JSON.stringify(orderInfo, null, 2)}</pre> {/* Hiển thị đơn hàng dưới dạng JSON */}
                    </div>
                )}
                {/* Không cần nút quay về trang chủ nữa */}
            </div>
        </div>
    );
};

export default PaymentCallback;
