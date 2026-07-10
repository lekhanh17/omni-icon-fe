"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import IconGrid, { IconGridItem } from "../../components/IconGrid";

interface Profile {
  _id: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myIcons, setMyIcons] = useState<IconGridItem[]>([]);
  const [favorites, setFavorites] = useState<IconGridItem[]>([]);
  const [tab, setTab] = useState<"icons" | "favorites">("icons");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetch("/api/me");

        if (meRes.status === 401) {
          router.push("/login");
          return;
        }

        const meData = await meRes.json();

        if (!meRes.ok) {
          setError(meData.message || "Không thể tải thông tin tài khoản.");
          return;
        }

        setProfile(meData.user);

        const [iconsRes, favoritesRes] = await Promise.all([
          fetch("/api/me/icons"),
          fetch("/api/me/favorites"),
        ]);
        const iconsData = await iconsRes.json();
        const favoritesData = await favoritesRes.json();

        if (iconsRes.ok) setMyIcons(iconsData.icons || []);
        if (favoritesRes.ok) setFavorites(favoritesData.icons || []);
      } catch {
        setError("Không thể kết nối đến máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-gray-400">Đang tải trang cá nhân...</p>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-red-500">{error || "Không tìm thấy tài khoản."}</p>
      </main>
    );
  }

  const totalLikesReceived = myIcons.reduce(
    (sum, icon) => sum + (icon.likedBy?.length ?? 0),
    0
  );

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16 bg-gray-50 w-full">
      <div className="w-full max-w-4xl">
        {/* HEADER TRANG CÁ NHÂN */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10 animate-fade-in-up">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-jade-900 text-white flex items-center justify-center text-4xl font-bold shadow-md overflow-hidden uppercase shrink-0">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              profile.name.charAt(0)
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <h1 className="text-xl font-bold text-gray-900">
                {profile.username ? `@${profile.username}` : profile.name}
              </h1>

              <div className="flex gap-2 justify-center sm:justify-start">
                <Link
                  href="/profile/edit"
                  className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Chỉnh sửa trang cá nhân
                </Link>
                {profile.username && (
                  <Link
                    href={`/u/${profile.username}`}
                    target="_blank"
                    className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Xem công khai
                  </Link>
                )}
              </div>
            </div>

            {/* Dashboard */}
            <div className="flex gap-8 justify-center sm:justify-start mb-4">
              <span className="text-sm text-gray-600">
                <strong className="text-gray-900">{myIcons.length}</strong>{" "}
                icon
              </span>
              <span className="text-sm text-gray-600">
                <strong className="text-gray-900">
                  {totalLikesReceived}
                </strong>{" "}
                lượt thích
              </span>
              <span className="text-sm text-gray-600">
                <strong className="text-gray-900">{favorites.length}</strong>{" "}
                yêu thích
              </span>
            </div>

            <p className="font-semibold text-gray-800">{profile.name}</p>
            {profile.bio && (
              <p className="text-gray-600 mt-1 whitespace-pre-line">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* TAB */}
        <div className="flex justify-center gap-10 border-t border-gray-200 mb-10">
          <button
            type="button"
            onClick={() => setTab("icons")}
            className={`flex items-center gap-2 py-4 text-sm font-semibold border-t-2 -mt-px transition-colors ${
              tab === "icons"
                ? "border-jade-900 text-jade-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
          Icon đã tạo
          </button>
          <button
            type="button"
            onClick={() => setTab("favorites")}
            className={`flex items-center gap-2 py-4 text-sm font-semibold border-t-2 -mt-px transition-colors ${
              tab === "favorites"
                ? "border-jade-900 text-jade-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            ♡ Yêu thích
          </button>
        </div>

        {/* NỘI DUNG */}
        {tab === "icons" ? (
          <IconGrid
            icons={myIcons}
            currentUserId={profile._id}
            emptyMessage="Bạn chưa tạo icon nào. Vào Chế tác Icon để bắt đầu!"
          />
        ) : (
          <IconGrid
            icons={favorites}
            currentUserId={profile._id}
            emptyMessage="Bạn chưa yêu thích icon nào."
          />
        )}
      </div>
    </main>
  );
}
