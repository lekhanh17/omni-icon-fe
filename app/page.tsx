import Link from "next/link";
import { connectToDatabase } from "../lib/db";
import Icon from "../models/Icon";
import User from "../models/User";
import IconGrid from "../components/IconGrid";

export default async function Home() {
  await connectToDatabase();

  const [iconCount, userCount, latestIcons] = await Promise.all([
    Icon.countDocuments(),
    User.countDocuments(),
    Icon.find().sort({ createdAt: -1 }).limit(5),
  ]);

  return (
    <main className="flex flex-col items-center justify-center w-full">
      {/* --- HERO SECTION (Phần gây ấn tượng đầu tiên) --- */}
      <section className="w-full bg-white py-24 flex flex-col items-center justify-center text-center px-4 border-b border-gray-200">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 max-w-4xl leading-tight animate-fade-in-up">
          Thư viện và Công cụ <br className="hidden md:block" />
          <span className="text-jade-500">Chế tác Icon</span> hoàn hảo
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mb-6">
          Tìm kiếm hàng ngàn icon chuẩn mực, hoặc tự tay thiết kế và xuất code
          trực tiếp sang React, Vue, HTML chỉ với vài cú click chuột.
        </p>

        {iconCount > 0 && (
          <p className="text-sm text-jade-700 font-semibold mb-6">
            {iconCount} icon đã được tạo bởi {userCount} người dùng
          </p>
        )}

        {/* Thanh tìm kiếm khổng lồ */}
        <div className="w-full max-w-2xl relative mb-12 shadow-lg rounded-full group">
          <input
            type="text"
            placeholder="Tìm kiếm icon (ví dụ: user, cart, arrow...)"
            className="w-full pl-8 pr-36 py-5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-jade-500 text-lg text-gray-900 placeholder-gray-400 transition-colors group-hover:border-gray-300"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-jade-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-jade-700 transition-colors">
            Tìm kiếm
          </button>
        </div>

        {/* Nút Call-to-Action */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/explore"
            className="px-8 py-3 bg-jade-900 text-white rounded-full font-semibold hover:bg-jade-700 transition-colors shadow-md"
          >
            Khám phá Thư viện
          </Link>
          <Link
            href="/builder"
            className="px-8 py-3 bg-white text-jade-900 border border-jade-200 rounded-full font-semibold hover:bg-jade-50 transition-colors shadow-sm"
          >
            Mở Icon Builder
          </Link>
        </div>
      </section>

      {/* --- TÍNH NĂNG NỔI BẬT --- */}
      <section className="w-full max-w-7xl mx-auto py-24 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-jade-200 transition-all">
          <div className="w-14 h-14 bg-jade-200/40 text-jade-900 rounded-2xl flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Thư viện đồ sộ
          </h3>
          <p className="text-gray-600">
            Truy cập hàng ngàn icon chất lượng cao được thiết kế chuẩn mực, phù
            hợp cho mọi dự án UI/UX.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-jade-200 transition-all">
          <div className="w-14 h-14 bg-jade-200/40 text-jade-900 rounded-2xl flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Tùy biến tự do
          </h3>
          <p className="text-gray-600">
            Trình Icon Builder mạnh mẽ cho phép tinh chỉnh màu sắc, kích thước,
            độ dày nét vẽ theo thời gian thực.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-jade-200 transition-all">
          <div className="w-14 h-14 bg-jade-200/40 text-jade-900 rounded-2xl flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Xuất Code Tự động
          </h3>
          <p className="text-gray-600">
            Copy ngay mã nguồn chuẩn xác cho các framework như React, Vue, HTML.
            Không cần tải file thủ công.
          </p>
        </div>
      </section>

      {/* --- ICON MỚI NHẤT TỪ CỘNG ĐỒNG --- */}
      {latestIcons.length > 0 && (
        <section className="w-full max-w-7xl mx-auto py-24 px-4">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Icon mới nhất
            </h2>
            <Link
              href="/explore"
              className="text-sm font-semibold text-jade-700 hover:text-jade-500 transition-colors"
            >
              Xem tất cả →
            </Link>
          </div>
          <IconGrid icons={JSON.parse(JSON.stringify(latestIcons))} />
        </section>
      )}
    </main>
  );
}