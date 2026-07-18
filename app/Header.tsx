"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";

interface SearchIconResult {
  _id: string;
  name: string;
  svgCode: string;
}

interface SearchUserResult {
  _id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    avatarUrl?: string;
    role?: string;
  } | null>(null);

  // --- Menu "Thêm" gom các mục ít dùng để Header đỡ chật ---
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Tìm kiếm nhanh (icon + người dùng) ---
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    icons: SearchIconResult[];
    users: SearchUserResult[];
  }>({ icons: [], users: [] });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    // Bọc cả nhánh "query rỗng" vào setTimeout để không setState đồng bộ
    // ngay trong thân effect (tránh lỗi eslint react-hooks/set-state-in-effect)
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults({ icons: [], users: [] });
        return;
      }

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (res.ok) {
          setSearchResults({ icons: data.icons || [], users: data.users || [] });
        }
      } catch {
        // Bỏ qua lỗi mạng khi gõ tìm kiếm nhanh
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Đóng dropdown khi click ra ngoài ô tìm kiếm
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowDropdown(false);
    router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
  };

  const hasSearchResults =
    searchResults.icons.length > 0 || searchResults.users.length > 0;

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

  // Tự đồng bộ role (và các trường khác) từ server - phòng trường hợp tài khoản
  // vừa được cấp quyền admin nhưng localStorage vẫn đang lưu dữ liệu cũ
  useEffect(() => {
    if (!currentUser) return;

    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) return;
        const data = await res.json();
        if (ignore || !data.user) return;

        if (
          data.user.role !== currentUser.role ||
          data.user.avatarUrl !== currentUser.avatarUrl
        ) {
          const updated = {
            ...currentUser,
            role: data.user.role,
            avatarUrl: data.user.avatarUrl,
          };
          setCurrentUser(updated);
          localStorage.setItem("user", JSON.stringify(updated));
        }
      } catch {
        // Bỏ qua lỗi mạng, giữ nguyên dữ liệu cũ trong localStorage
      }
    })();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email]);

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
              <div ref={moreMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen((o) => !o)}
                  className="flex items-center gap-1 text-gray-600 hover:text-jade-500 font-semibold transition-colors"
                >
                  Thêm
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${
                      moreMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {moreMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 animate-fade-in-up">
                    <Link
                      href="/favorites"
                      onClick={() => setMoreMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-jade-50/60 transition-colors"
                    >
                      Yêu thích
                    </Link>
                    <Link
                      href="/following"
                      onClick={() => setMoreMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-jade-50/60 transition-colors"
                    >
                      Đang theo dõi
                    </Link>
                    <Link
                      href="/collections"
                      onClick={() => setMoreMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-jade-50/60 transition-colors"
                    >
                      Bộ sưu tập
                    </Link>
                    {(currentUser.role === "admin" ||
                      currentUser.role === "staff") && (
                      <>
                        <div className="my-1 border-t border-gray-100" />
                        <Link
                          href="/admin"
                          onClick={() => setMoreMenuOpen(false)}
                          className="block px-4 py-2 text-sm font-semibold text-jade-700 hover:bg-jade-50/60 transition-colors"
                        >
                          Quản trị
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* Thanh tìm kiếm (Mini) */}
        <div
          ref={searchBoxRef}
          className="hidden flex-1 max-w-md mx-8 lg:block relative"
        >
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Tìm kiếm icon hoặc người dùng..."
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
          </form>

          {/* Dropdown gợi ý */}
          {showDropdown && query.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto animate-fade-in-up">
              {!hasSearchResults ? (
                <p className="px-4 py-4 text-sm text-gray-400 text-center">
                  Không tìm thấy kết quả nào.
                </p>
              ) : (
                <>
                  {searchResults.icons.length > 0 && (
                    <div className="py-2">
                      <p className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
                        Icon
                      </p>
                      {searchResults.icons.map((icon) => (
                        <Link
                          key={icon._id}
                          href={`/explore?q=${encodeURIComponent(icon.name)}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-jade-50/60 transition-colors"
                        >
                          <div
                            className="w-6 h-6 text-jade-900 shrink-0 [&>svg]:w-full [&>svg]:h-full"
                            dangerouslySetInnerHTML={{ __html: icon.svgCode }}
                          />
                          <span className="text-sm text-gray-700 truncate">
                            {icon.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.users.length > 0 && (
                    <div className="py-2 border-t border-gray-100">
                      <p className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
                        Người dùng
                      </p>
                      {searchResults.users.map((user) => (
                        <Link
                          key={user._id}
                          href={`/u/${user.username}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-jade-50/60 transition-colors"
                        >
                          <div className="w-6 h-6 rounded-full bg-jade-900 text-white flex items-center justify-center text-[10px] font-bold overflow-hidden uppercase shrink-0">
                            {user.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              user.name.charAt(0)
                            )}
                          </div>
                          <span className="text-sm text-gray-700 truncate">
                            {user.name}{" "}
                            <span className="text-gray-400">
                              @{user.username}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Cụm Nút Đăng nhập / Đăng ký bên phải */}
        <div className="flex items-center gap-2 sm:gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <NotificationBell />
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
                <span className="text-sm font-semibold text-gray-700 hidden md:inline max-w-30 truncate whitespace-nowrap">
                  Chào, {currentUser.name}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-red-600 hover:text-red-500 px-4 py-1.5 border border-red-200 hover:border-red-400 rounded-full bg-red-50/20 transition-all shadow-sm shrink-0 whitespace-nowrap"
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
