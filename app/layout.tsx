import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./Header"; // Nhập cấu phần Header động vào đây

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
        {/* --- THANH HEADER ĐỘNG (Đã được xử lý phân tách cấu phần) --- */}
        <Header />

        {/* --- NỘI DUNG TRANG --- */}
        <div className="min-h-screen bg-jade-50/30">{children}</div>
      </body>
    </html>
  );
}