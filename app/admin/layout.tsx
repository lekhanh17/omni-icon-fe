import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connectToDatabase } from "../../lib/db";
import User from "../../models/User";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../lib/auth";

// Bọc toàn bộ /admin/*: chỉ tài khoản có role "admin" mới vào được, còn lại chuyển hướng ra ngoài
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!userId) {
    redirect("/login");
  }

  await connectToDatabase();
  const user = await User.findById(userId).select("role");

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-12 bg-gray-50 w-full">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Trang quản trị
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Quản lý người dùng, icon và bình luận trên toàn hệ thống.
        </p>

        <nav className="flex gap-2 mb-8 border-b border-gray-200">
          <Link
            href="/admin"
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-jade-700 border-b-2 border-transparent hover:border-jade-500 transition-colors"
          >
            Tổng quan
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-jade-700 border-b-2 border-transparent hover:border-jade-500 transition-colors"
          >
            Người dùng
          </Link>
          <Link
            href="/admin/icons"
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-jade-700 border-b-2 border-transparent hover:border-jade-500 transition-colors"
          >
            Icon
          </Link>
          <Link
            href="/admin/comments"
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-jade-700 border-b-2 border-transparent hover:border-jade-500 transition-colors"
          >
            Bình luận
          </Link>
        </nav>

        {children}
      </div>
    </main>
  );
}
