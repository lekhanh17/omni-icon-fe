"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  // Khởi tạo trạng thái để lưu thông tin Email người dùng nhập vào
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Hàm xử lý khi bấm Đăng nhập (Sửa thành async để gọi API thực tế)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Kiểm tra độ dài mật khẩu phía Client trước
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    try {
      // Gửi request POST tới API đăng nhập phía Server
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      // Nếu API trả về lỗi (Ví dụ: Sai email hoặc sai mật khẩu)
      if (!res.ok) {
        setError(data.message || "Đăng nhập thất bại.");
        return;
      }

      // Xử lý LƯU THÔNG TIN vào bộ nhớ trình duyệt ở đây:
      localStorage.setItem("user", JSON.stringify(data.user));

      // Nếu hợp lệ -> Hiện thành công và chuyển trang
      setSuccess(true);
      setTimeout(() => {
        router.push("/builder"); // Chuyển thẳng vào không gian làm việc
      }, 1500);
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-jade-200/60">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-jade-900 tracking-tight">
            Đăng nhập
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            Chào mừng trở lại! Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-semibold text-jade-700 hover:text-jade-500 transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Nối form với hàm handleSubmit */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ô nhập Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500 transition-all text-gray-900"
              required
            />
          </div>

          {/* Ô nhập Mật khẩu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // Đổi viền sang màu đỏ nếu có lỗi
                className={`w-full pl-5 pr-12 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900 ${
                  error && password.length < 8
                    ? "border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50/50"
                    : "border-gray-200 focus:ring-jade-500 focus:border-jade-500"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-jade-600 transition-colors"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 92.9-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.8-35.7-46.1-87.7-92.9-131.1C433.5 68.8 368.8 32 288 32zM128 256a160 160 0 1 1 320 0 160 160 0 1 1 -320 0zm160 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.8-35.7-46.1-87.7-92.9-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c88.4 0 160 71.6 160 160c0 36.7-12.3 70.3-33.1 96.9L223.1 149.5zM414.6 422.4C384.8 433.5 353 440 320 440c-80.8 0-145.5-36.8-192.6-80.6C80.6 315.9 49.3 264 34.5 228.3c-3.3-7.9-3.3-16.7 0-24.6c14.8-35.7 46.1-87.7-92.9-131.1C133 65.4 140 59 147.2 53L192.7 88.7c-29.2 26.6-53.1 58.7-72.3 93.3c35.6 64 96.2 121.3 199.6 121.3c23.2 0 44.8-4.1 64.5-11.4L414.6 422.4z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-jade-900 focus:ring-jade-500 border-gray-300 rounded cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-600 cursor-pointer"
              >
                Ghi nhớ phiên đăng nhập
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="font-semibold text-jade-700 hover:text-jade-500 transition-colors"
              >
                Quên mật khẩu?
              </a>
            </div>
          </div>

          {/* Khối báo Lỗi */}
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg font-medium shadow-sm animate-pulse">
              ⚠️ {error}
            </div>
          )}

          {/* Khối báo Thành công */}
          {success && (
            <div className="p-3 bg-jade-50 border-l-4 border-jade-500 text-jade-900 text-sm rounded-r-lg font-medium shadow-sm">
              ✅ Đăng nhập thành công! Đang vào không gian làm việc...
            </div>
          )}

          <button
            type="submit"
            disabled={success}
            className="w-full flex justify-center py-3.5 px-4 mt-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-jade-900 hover:bg-jade-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jade-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {success ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </main>
  );
}
