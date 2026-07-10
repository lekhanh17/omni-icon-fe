import Link from "next/link";
import { connectToDatabase } from "../lib/db";
import Icon from "../models/Icon";
import User from "../models/User";
import IconGrid from "../components/IconGrid";
import { categories } from "../lib/categories";
import { shapes } from "../lib/shapes";

// Icon minh hoạ đại diện cho từng danh mục ở khu vực "Danh mục nổi bật"
const categoryShapeMap: Record<string, string> = {
  general: "star",
  ui: "check",
  commerce: "shopping-cart",
  communication: "mail",
  other: "bell",
};

export default async function Home() {
  await connectToDatabase();

  const [iconCount, userCount, latestIcons, popularIcons, categoryCountsRaw] =
    await Promise.all([
      Icon.countDocuments(),
      User.countDocuments(),
      Icon.find().sort({ createdAt: -1 }).limit(5),
      // Icon được yêu thích nhiều nhất (chỉ lấy icon có ít nhất 1 lượt thích)
      Icon.aggregate([
        {
          $addFields: {
            likesCount: { $size: { $ifNull: ["$likedBy", []] } },
          },
        },
        { $match: { likesCount: { $gt: 0 } } },
        { $sort: { likesCount: -1, createdAt: -1 } },
        { $limit: 6 },
      ]),
      // Số lượng icon theo từng danh mục
      Icon.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    ]);

  const categoryCountMap: Record<string, number> = {};
  for (const row of categoryCountsRaw as { _id: string; count: number }[]) {
    categoryCountMap[row._id] = row.count;
  }

  return (
    <main className="flex flex-col items-center justify-center w-full">
      {/* --- HERO SECTION (Phần gây ấn tượng đầu tiên) --- */}
      <section className="w-full bg-white py-24 flex flex-col items-center justify-center text-center px-4 border-b border-gray-200">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 max-w-4xl leading-tight animate-fade-in-up">
          Thư viện và Công cụ <br className="hidden md:block" />
          <span className="text-jade-500">Tạo Icon</span> phù hợp
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

        {/* Thanh tìm kiếm khổng lồ - form GET thẳng tới /explore, không cần JS */}
        <form
          action="/explore"
          method="GET"
          className="w-full max-w-2xl relative mb-12 shadow-lg rounded-full group"
        >
          <input
            type="text"
            name="q"
            placeholder="Tìm kiếm icon (ví dụ: user, cart, arrow...)"
            className="w-full pl-8 pr-36 py-5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-jade-500 text-lg text-gray-900 placeholder-gray-400 transition-colors group-hover:border-gray-300"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-jade-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-jade-700 transition-colors"
          >
            Tìm kiếm
          </button>
        </form>

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

      {/* --- DANH MỤC NỔI BẬT --- */}
      <section className="w-full max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
          Danh mục nổi bật
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {categories.map((cat) => {
            const shape = shapes.find(
              (s) => s.id === (categoryShapeMap[cat.id] ?? "star")
            );
            const count = categoryCountMap[cat.id] ?? 0;
            return (
              <Link
                key={cat.id}
                href={`/explore?category=${cat.id}`}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-jade-200 transition-all flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 bg-jade-200/40 text-jade-900 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dangerouslySetInnerHTML={{ __html: shape?.markup ?? "" }}
                  />
                </div>
                <p className="font-bold text-gray-900">{cat.label}</p>
                <p className="text-xs text-gray-400 mt-1">{count} icon</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* --- ICON PHỔ BIẾN (nhiều lượt thích nhất) --- */}
      {popularIcons.length > 0 && (
        <section className="w-full max-w-7xl mx-auto py-8 px-4">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Icon phổ biến
            </h2>
            <Link
              href="/explore"
              className="text-sm font-semibold text-jade-700 hover:text-jade-500 transition-colors"
            >
              Xem tất cả →
            </Link>
          </div>
          <IconGrid icons={JSON.parse(JSON.stringify(popularIcons))} />
        </section>
      )}

      {/* --- ICON MỚI NHẤT TỪ CỘNG ĐỒNG --- */}
      {latestIcons.length > 0 && (
        <section className="w-full max-w-7xl mx-auto py-8 px-4">
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
    </main>
  );
}
