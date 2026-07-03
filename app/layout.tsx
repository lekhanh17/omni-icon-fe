import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OmniIcon",
  description: "Nền tảng tự thiết kế và sinh code Icon số 1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        
        {/* --- THANH HEADER --- */}
        <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Cụm Logo & Menu bên trái */}
            <div className="flex-shrink-0 flex items-center gap-8">
              <Link href="/" className="text-2xl font-black text-jade-900 tracking-tighter">
                OmniIcon.
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link href="/explore" className="text-gray-600 hover:text-jade-500 font-semibold transition-colors">
                  Thư viện
                </Link>
                <Link href="/builder" className="text-gray-600 hover:text-jade-500 font-semibold transition-colors">
                  Chế tác Icon
                </Link>
              </nav>
            </div>

            {/* Thanh tìm kiếm (Mini) */}
            <div className="hidden flex-1 max-w-md mx-8 lg:block relative">
              <input
                type="text"
                placeholder="Tìm kiếm icon nhanh..."
                className="w-full pl-10 pr-4 py-2 bg-jade-50/50 border border-gray-200 rounded-full focus:outline-none focus:border-jade-500 focus:ring-1 focus:ring-jade-500 text-sm text-gray-900 placeholder-gray-400 transition-all"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Cụm Nút Đăng nhập / Đăng ký bên phải */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-jade-500 px-3 py-2 transition-colors hidden sm:block">
                Đăng nhập
              </Link>
              <Link href="/register" className="text-sm font-semibold bg-jade-900 text-white px-5 py-2 rounded-full hover:bg-jade-700 transition-colors shadow-sm">
                Đăng ký
              </Link>
            </div>

          </div>
        </header>

        {/* --- NỘI DUNG TRANG --- */}
        <div className="min-h-screen bg-jade-50/30">
          {children}
        </div>
        
      </body>
    </html>
  );
}