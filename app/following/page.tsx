import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectToDatabase } from "../../lib/db";
import Follow from "../../models/Follow";
import Icon from "../../models/Icon";
import IconGrid from "../../components/IconGrid";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../lib/auth";

// Bảng tin: icon mới nhất từ những người mình đang theo dõi
export default async function FollowingFeedPage() {
  const cookieStore = await cookies();
  const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!userId) {
    redirect("/login");
  }

  await connectToDatabase();

  const follows = await Follow.find({ followerId: userId }).select("followingId");
  const followingIds = follows.map((f) => f.followingId);

  const icons =
    followingIds.length > 0
      ? await Icon.find({ authorId: { $in: followingIds } })
          .sort({ createdAt: -1 })
          .limit(60)
      : [];

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16 bg-gray-50 w-full">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Đang theo dõi
        </h1>
        <p className="text-gray-500 mb-10">
          Icon mới nhất từ những người bạn đang theo dõi.
        </p>

        {followingIds.length === 0 ? (
          <p className="text-center text-gray-400 py-16">
            Bạn chưa theo dõi ai. Ghé thăm trang cá nhân của một nhà thiết kế
            và bấm &quot;+ Theo dõi&quot; để bắt đầu.
          </p>
        ) : (
          <IconGrid
            icons={JSON.parse(JSON.stringify(icons))}
            currentUserId={userId}
            emptyMessage="Những người bạn theo dõi chưa đăng icon nào."
          />
        )}
      </div>
    </main>
  );
}
