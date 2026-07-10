"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import IconGrid, { IconGridItem } from "../../components/IconGrid";
import { categories } from "../../lib/categories";

// useSearchParams() bắt buộc phải nằm trong <Suspense>, nếu không "next build"
// (production build) sẽ báo lỗi, dù "next dev" vẫn chạy bình thường.
export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExploreContent />
    </Suspense>
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const [icons, setIcons] = useState<IconGridItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") ?? ""
  );
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setCurrentUserId(JSON.parse(stored).id);
      } catch {
        setCurrentUserId(undefined);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchIcons = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search.trim());
        if (activeCategory) params.set("category", activeCategory);

        const res = await fetch(`/api/icons?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Không thể tải danh sách icon.");
          return;
        }

        setIcons(data.icons || []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchIcons, 300); // debounce khi gõ tìm kiếm

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, activeCategory]);

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16 bg-gray-50 w-full">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl font-extrabold text-jade-900 mb-3 animate-fade-in-up">
          Thư viện Icon
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Duyệt và sử dụng các icon do cộng đồng tạo ra từ Icon Builder.
        </p>

        {/* Ô tìm kiếm */}
        <div className="mb-6 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm icon theo tên hoặc tag..."
            className="w-full px-5 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500 text-gray-900 shadow-sm"
          />
        </div>

        {/* Bộ lọc danh mục */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            type="button"
            onClick={() => setActiveCategory("")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              activeCategory === ""
                ? "bg-jade-900 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-jade-300"
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat.id
                  ? "bg-jade-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-jade-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-lg bg-gray-200 animate-skeleton mb-4" />
                <div className="h-3 w-3/4 bg-gray-200 animate-skeleton rounded mb-3" />
                <div className="h-7 w-full bg-gray-100 animate-skeleton rounded-full" />
              </div>
            ))}
          </div>
        ) : icons.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">Chưa có icon nào phù hợp.</p>
            <p className="text-sm">
              Hãy vào{" "}
              <a
                href="/builder"
                className="text-jade-700 font-semibold underline"
              >
                Icon Builder
              </a>{" "}
              để tạo và lưu icon đầu tiên!
            </p>
          </div>
        ) : (
          <IconGrid icons={icons} currentUserId={currentUserId} />
        )}
      </div>
    </main>
  );
}
