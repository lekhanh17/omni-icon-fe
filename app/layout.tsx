import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Cần import Link từ next/link để làm nút chuyển trang
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
        {/* --- THANH HEADER DÙNG CHUNG --- */}
        <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Cụm Logo bên trái */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="text-2xl font-black text-blue-600 tracking-tighter"
              >
                OmniIcon.
              </Link>
            </div>

            {/* Cụm Menu bên phải */}
            <nav className="flex gap-6">
              <Link
                href="/explore"
                className="text-gray-600 hover:text-blue-600 font-semibold transition-colors"
              >
                Thư viện
              </Link>
              <Link
                href="/builder"
                className="text-gray-600 hover:text-blue-600 font-semibold transition-colors"
              >
                Chế tác Icon
              </Link>
            </nav>
          </div>
        </header>

        {/* --- NỘI DUNG TỪNG TRANG SẼ ĐƯỢC BƠM VÀO ĐÂY --- */}
        <div className="min-h-screen bg-gray-50">{children}</div>
      </body>
    </html>
  );
}
