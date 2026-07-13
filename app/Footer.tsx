import Link from "next/link";

// Footer dùng chung cho toàn bộ trang - Server Component, không cần state
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-jade-900 text-jade-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 sm:grid-cols-4 gap-10">
        {/* Thương hiệu */}
        <div className="col-span-2 sm:col-span-1">
          <Link
            href="/"
            className="text-2xl font-black text-white tracking-tighter"
          >
            OmniIcon.
          </Link>
          <p className="mt-3 text-sm text-jade-200/80 leading-relaxed max-w-xs">
            Nền tảng tự thiết kế, khám phá và sinh code Icon dành cho lập
            trình viên và nhà thiết kế.
          </p>
        </div>

        {/* Sản phẩm */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">
            Sản phẩm
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/explore" className="text-jade-200/80 hover:text-white transition-colors">
                Thư viện icon
              </Link>
            </li>
            <li>
              <Link href="/builder" className="text-jade-200/80 hover:text-white transition-colors">
                Chế tác icon
              </Link>
            </li>
            <li>
              <Link href="/leaderboard" className="text-jade-200/80 hover:text-white transition-colors">
                Xếp hạng
              </Link>
            </li>
            <li>
              <Link href="/collections" className="text-jade-200/80 hover:text-white transition-colors">
                Bộ sưu tập
              </Link>
            </li>
          </ul>
        </div>

        {/* Tài khoản */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">
            Tài khoản
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/login" className="text-jade-200/80 hover:text-white transition-colors">
                Đăng nhập
              </Link>
            </li>
            <li>
              <Link href="/register" className="text-jade-200/80 hover:text-white transition-colors">
                Đăng ký
              </Link>
            </li>
            <li>
              <Link href="/profile" className="text-jade-200/80 hover:text-white transition-colors">
                Hồ sơ cá nhân
              </Link>
            </li>
            <li>
              <Link href="/favorites" className="text-jade-200/80 hover:text-white transition-colors">
                Yêu thích
              </Link>
            </li>
          </ul>
        </div>

        {/* Định dạng xuất code */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">
            Định dạng xuất
          </h3>
          <ul className="space-y-3 text-sm text-jade-200/80">
            <li>SVG</li>
            <li>HTML</li>
            <li>React (JSX)</li>
            <li>Vue</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-jade-200/60">
          <p>© {year} OmniIcon. Bảo lưu mọi quyền.</p>
          <p>Thiết kế dành cho cộng đồng lập trình viên và nhà thiết kế.</p>
        </div>
      </div>
    </footer>
  );
}
