"use client";

import { useEffect, useState } from "react";

interface IconItem {
  _id: string;
  name: string;
  svgCode: string;
  color: string;
  size: number;
  strokeWidth: number;
  authorName?: string;
  tags?: string[];
  createdAt: string;
}

export default function ExplorePage() {
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchIcons = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search.trim());

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
  }, [search]);

  const handleCopy = (icon: IconItem) => {
    navigator.clipboard.writeText(icon.svgCode);
    setCopiedId(icon._id);
    setTimeout(() => setCopiedId((prev) => (prev === icon._id ? null : prev)), 1500);
  };

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16 bg-gray-50 w-full">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl font-extrabold text-jade-900 mb-3">
          Thư viện Icon
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Duyệt và sử dụng các icon do cộng đồng tạo ra từ Icon Builder.
        </p>

        {/* Ô tìm kiếm */}
        <div className="mb-10 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm icon theo tên hoặc tag..."
            className="w-full px-5 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500 text-gray-900 shadow-sm"
          />
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Đang tải icon...</p>
        ) : icons.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">Chưa có icon nào phù hợp.</p>
            <p className="text-sm">
              Hãy vào{" "}
              <a href="/builder" className="text-jade-700 font-semibold underline">
                Icon Builder
              </a>{" "}
              để tạo và lưu icon đầu tiên!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {icons.map((icon) => (
              <div
                key={icon._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-jade-200 transition-all p-5 flex flex-col items-center"
              >
                <div
                  className="w-16 h-16 flex items-center justify-center mb-4 [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: icon.svgCode }}
                />
                <p className="text-sm font-semibold text-gray-800 text-center truncate w-full mb-3">
                  {icon.name}
                </p>
                <button
                  onClick={() => handleCopy(icon)}
                  className="text-xs bg-jade-50 hover:bg-jade-200/60 text-jade-900 px-3 py-1.5 rounded-full font-semibold transition-colors w-full"
                >
                  {copiedId === icon._id ? "Đã copy!" : "Copy SVG"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
