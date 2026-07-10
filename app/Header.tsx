"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    avatarUrl?: string;
  } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    // Bọc trong setTimeout để chuyển sang xử lý bất đồng bộ (Asynchronous)
    // Giúp loại bỏ hoàn toàn lỗi nghiêm ngặt "set-state-in-effect" của ESLint
    const timer = setTimeout(() => {
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    }, 0);

    // Hàm đồng bộ khi thay đổi thông tin ở các cửa sổ/tab khác
    const handleStorageChange = () => {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          setCurrentUser(JSON.parse(user));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearTimeout(timer); // Dọn dẹp bộ định thời khi hủy cấu phần
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [pathname]);

  // Hàm xử lý Đăng xuất
  const handleLogout = async () => {
    try {
      // Xóa session cookie httpOnly ở phía server, không chỉ dọn localStorage
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // Vẫn tiếp tục đăng xuất phía client kể cả khi lỗi mạng
    }
    localStorage.removeItem("user");
    setCurrentUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Cụm Logo & Menu bên trái */}
        <div className="shrink-0 flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-black text-jade-900 tracking-tighter"
          >
            OmniIcon.
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/explore"
              className="text-gray-600 hover:text-jade-500 font-semibold transition-colors"
            >
              Thư viện
            </Link>
            <Link
              href="/builder"
              className="text-gray-600 hover:text-jade-500 font-semibold transition-colors"
            >
              Chế tác Icon
            </Link>
            <Link
              href="/leaderboard"
              className="text-gray-600 hover:text-jade-500 font-semibold transition-colors"
            >
              Xếp hạng
            </Link>
            {currentUser && (
              <Link
                href="/favorites"
                className="text-gray-600 hover:text-jade-500 font-semibold transition-colors"
              >
                Yêu thích
              </Link>
            )}
          </nav>
        </div>

        {/* Thanh tìm kiếm (Mini) */}
        <div className="hidden flex-1 max-w-md mx-8 lg:block relative">
          <input
            type="text"
            placeholder="Tìm kiếm icon nhanh..."
            className="w-full pl-10 pr-4 py-2 bg-jade-50/50 border border-gray-200 rounded-full focus:outline-none focus:border-jade-500 focus:ring-1 focus:ring-jade-500 text-sm text-gray-900 placeholder-gray-400 transition-all"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Cụm Nút Đăng nhập / Đăng ký bên phải */}
        <div className="flex items-center gap-2 sm:gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-jade-900 text-white flex items-center justify-center font-bold text-sm shadow-sm select-none uppercase overflow-hidden">
                  {currentUser.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700 hidden md:inline max-w-30 truncate">
                  Chào, {currentUser.name}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-red-600 hover:text-red-500 px-4 py-1.5 border border-red-200 hover:border-red-400 rounded-full bg-red-50/20 transition-all shadow-sm"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-600 hover:text-jade-500 px-3 py-2 transition-colors hidden sm:block"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-jade-900 text-white px-5 py-2 rounded-full hover:bg-jade-700 transition-colors shadow-sm"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
