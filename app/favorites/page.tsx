"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import IconGrid, { IconGridItem } from "../../components/IconGrid";

export default function FavoritesPage() {
  const router = useRouter();
  const [icons, setIcons] = useState<IconGridItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    const loadFavorites = async () => {
      try {
        const res = await fetch("/api/me/favorites");

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        const data = await res.json();

        if (res.ok) {
          setIcons(data.icons || []);
        } else {
          setError(data.message || "Không thể tải danh sách yêu thích.");
        }
      } catch {
        setError("Không thể kết nối đến máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16 bg-gray-50 w-full">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl font-extrabold text-jade-900 mb-3">
          Icon yêu thích
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          Những icon bạn đã lưu để dùng lại sau này.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
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
        ) : (
          <IconGrid
            icons={icons}
            currentUserId={currentUserId}
            emptyMessage="Bạn chưa yêu thích icon nào. Ghé Thư viện để khám phá!"
          />
        )}
      </div>
    </main>
  );
}
