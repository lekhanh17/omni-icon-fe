"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import IconGrid, { IconGridItem } from "../../components/IconGrid";
import { categories } from "../../lib/categories";

interface Profile {
  _id: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

interface TopIcon {
  _id: string;
  name: string;
  svgCode: string;
  likesCount: number;
  commentsCount: number;
}

interface StatsData {
  iconCount: number;
  totalLikesReceived: number;
  totalCommentsReceived: number;
  followerCount: number;
  followingCount: number;
  topIcons: TopIcon[];
  categoryBreakdown: Record<string, number>;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myIcons, setMyIcons] = useState<IconGridItem[]>([]);
  const [favorites, setFavorites] = useState<IconGridItem[]>([]);
  const [tab, setTab] = useState<"icons" | "favorites" | "stats">("icons");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

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

  const handleTabClick = (nextTab: "icons" | "favorites" | "stats") => {
    setTab(nextTab);
    if (nextTab === "stats" && !stats && !statsLoading) {
      setStatsLoading(true);
      fetch("/api/me/stats")
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch(() => {
          // Bỏ qua lỗi mạng, người dùng có thể chuyển tab lại để thử tải lần nữa
        })
        .finally(() => setStatsLoading(false));
    }
  };

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
            onClick={() => handleTabClick("icons")}
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
            onClick={() => handleTabClick("favorites")}
            className={`flex items-center gap-2 py-4 text-sm font-semibold border-t-2 -mt-px transition-colors ${
              tab === "favorites"
                ? "border-jade-900 text-jade-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            ♡ Yêu thích
          </button>
          <button
            type="button"
            onClick={() => handleTabClick("stats")}
            className={`flex items-center gap-2 py-4 text-sm font-semibold border-t-2 -mt-px transition-colors ${
              tab === "stats"
                ? "border-jade-900 text-jade-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Thống kê
          </button>
        </div>

        {/* NỘI DUNG */}
        {tab === "icons" ? (
          <IconGrid
            icons={myIcons}
            currentUserId={profile._id}
            emptyMessage="Bạn chưa tạo icon nào. Vào Chế tác Icon để bắt đầu!"
          />
        ) : tab === "favorites" ? (
          <IconGrid
            icons={favorites}
            currentUserId={profile._id}
            emptyMessage="Bạn chưa yêu thích icon nào."
          />
        ) : statsLoading || !stats ? (
          <p className="text-center text-gray-400 py-16">
            {statsLoading ? "Đang tải thống kê..." : "Không thể tải thống kê."}
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Thẻ số liệu tổng quan */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[
                { label: "Icon đã tạo", value: stats.iconCount },
                {
                  label: "Lượt thích nhận được",
                  value: stats.totalLikesReceived,
                },
                {
                  label: "Bình luận nhận được",
                  value: stats.totalCommentsReceived,
                },
                { label: "Người theo dõi", value: stats.followerCount },
                { label: "Đang theo dõi", value: stats.followingCount },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center"
                >
                  <p className="text-2xl font-extrabold text-jade-900">
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Icon nổi bật nhất */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Icon nổi bật nhất của bạn
              </h2>
              {stats.topIcons.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Chưa có icon nào để xếp hạng.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {stats.topIcons.map((icon, index) => (
                    <Link
                      key={icon._id}
                      href={`/icon/${icon._id}`}
                      className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm p-3 hover:border-jade-200 hover:shadow-md transition-all"
                    >
                      <span className="text-sm font-bold text-gray-300 w-5 text-center shrink-0">
                        {index + 1}
                      </span>
                      <div
                        className="w-10 h-10 shrink-0 [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: icon.svgCode }}
                      />
                      <p className="flex-1 text-sm font-semibold text-gray-800 truncate">
                        {icon.name}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0">
                        ♡ {icon.likesCount} · {icon.commentsCount} bình luận
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Phân bố theo danh mục */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Icon theo danh mục
              </h2>
              {stats.iconCount === 0 ? (
                <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {categories.map((cat) => {
                    const count = stats.categoryBreakdown[cat.id] ?? 0;
                    if (count === 0) return null;
                    const percent = Math.round(
                      (count / stats.iconCount) * 100
                    );
                    return (
                      <div key={cat.id}>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{cat.label}</span>
                          <span>{count} icon</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-jade-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
