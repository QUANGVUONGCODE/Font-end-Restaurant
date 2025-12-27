import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigation } from "../utils/navagation";

interface FooterProps {
  heroImage: string;
}

const CreateAccountPage: React.FC<FooterProps> = ({ heroImage }) => {
  const { goToLogin } = useNavigation();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= CREATE ACCOUNT ================= */
  const createAccount = async () => {
    setLoading(true);

    // ❌ mật khẩu không khớp
    if (password !== confirmPassword) {
      toast.error("❌ Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    const payload = {
      full_name: fullName,
      phone_number: phone,
      address,
      email,
      password,
      retype_password: confirmPassword,
      date_of_birth: dateOfBirth,
    };

    try {
      const response = await fetch(
        "http://localhost:8080/restaurant/api/v1/user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": "vi",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // ❌ trùng số điện thoại
        if (data.message?.includes("Phone")) {
          toast.error("📵 Số điện thoại đã được sử dụng");
        }
        // ❌ trùng email
        else if (data.message?.includes("Email")) {
          toast.error("📧 Email đã được sử dụng");
        } else {
          toast.error("❌ Tạo tài khoản thất bại");
        }
        return;
      }

      if (data.code === 0) {
        toast.success("🎉 Tạo tài khoản thành công!");
        setTimeout(() => {
          goToLogin();
        }, 1200);
      } else {
        toast.error("❌ Tạo tài khoản thất bại");
      }
    } catch (error) {
      toast.error("🚨 Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI (GIỮ NGUYÊN) ================= */
  return (
    <div
      className="flex justify-center items-center min-h-screen bg-gray-100 p-6 mt-16"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Đăng ký</h2>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Họ và tên
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Địa chỉ
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* DOB */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Ngày sinh
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <button
            type="button"
            onClick={createAccount}
            disabled={loading}
            className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            {loading ? "Đang tạo tài khoản..." : "TẠO TÀI KHOẢN"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountPage;
