import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { connectToDatabase } from "../../../lib/db";
import User from "../../../models/User";
import Icon from "../../../models/Icon";
import IconGrid from "../../../components/IconGrid";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../lib/auth";

interface PageProps {
  params: Promise<{ username: string }>;
}

// Trang cá nhân công khai (kiểu TikTok/Facebook): ai cũng xem được, không cần đăng nhập
export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;

  await connectToDatabase();

  const user = await User.findOne({
    username: username.toLowerCase(),
  }).select("name username bio avatarUrl createdAt");

  if (!user) {
    notFound();
  }

  const icons = await Icon.find({ authorId: user._id })
    .sort({ createdAt: -1 })
    .limit(100);

  // Biết ai đang xem (nếu có đăng nhập) để hiển thị đúng trạng thái nút Yêu thích
  const cookieStore = await cookies();
  const currentUserId =
    verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value) ??
    undefined;

  const joinedDate = new Date(user.createdAt).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16 bg-gray-50 w-full">
      <div className="w-full max-w-5xl">
        {/* Header hồ sơ */}
        <div className="flex flex-col items-center text-center mb-12 animate-fade-in-up">
          <div className="w-24 h-24 rounded-full bg-jade-900 text-white flex items-center justify-center text-3xl font-bold shadow-md mb-4 overflow-hidden uppercase">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              user.name.charAt(0)
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900">
            {user.name}
          </h1>
          <p className="text-gray-400 text-sm mb-3">@{user.username}</p>

          {user.bio && (
            <p className="text-gray-600 max-w-md mb-4">{user.bio}</p>
          )}

          <div className="flex gap-6 text-sm text-gray-500">
            <span>
              <strong className="text-gray-900">{icons.length}</strong> icon
              đã tạo
            </span>
            <span>Tham gia {joinedDate}</span>
          </div>
        </div>

        <IconGrid
          icons={JSON.parse(JSON.stringify(icons))}
          currentUserId={currentUserId}
          emptyMessage="Người dùng này chưa lưu icon nào."
        />
      </div>
    </main>
  );
}
