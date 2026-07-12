import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "../../../lib/db";
import Icon from "../../../models/Icon";
import User from "../../../models/User";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../lib/auth";
import { categories } from "../../../lib/categories";
import {
  AddToCollectionButton,
  IconExportCode,
  IconLikeButton,
  ReportButton,
} from "./IconDetailActions";
import IconComments from "./IconComments";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Trang xem chi tiết 1 icon (kiểu trang chi tiết icon của FontAwesome):
// preview lớn, thông tin, nút Yêu thích và bảng xuất code nhiều định dạng.
export default async function IconDetailPage({ params }: PageProps) {
  const { id } = await params;

  await connectToDatabase();

  let icon = null;
  try {
    icon = await Icon.findById(id);
  } catch {
    // id không đúng định dạng ObjectId -> coi như không tìm thấy
    icon = null;
  }

  if (!icon) {
    notFound();
  }

  const author = icon.authorId
    ? await User.findById(icon.authorId).select("name username avatarUrl")
    : null;

  // Biết ai đang xem (nếu có đăng nhập) để hiển thị đúng trạng thái nút Yêu thích
  const cookieStore = await cookies();
  const currentUserId =
    verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value) ??
    undefined;

  const categoryLabel =
    categories.find((c) => c.id === icon.category)?.label ?? icon.category;

  const createdDate = new Date(icon.createdAt).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const authorDisplayName = author?.name || icon.authorName || "Ẩn danh";

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16 bg-gray-50 w-full">
      <div className="w-full max-w-4xl">
        {/* Khối chính: preview + thông tin gộp chung 1 card cho gọn gàng */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
            {/* Preview vuông, nền chấm nhẹ tạo chiều sâu thay vì khoảng trắng trống trơn */}
            <div
              className="aspect-square rounded-2xl border border-gray-100 flex items-center justify-center p-8"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #e2e8f0 1px, transparent 1px)",
                backgroundSize: "14px 14px",
                backgroundColor: "#fafafa",
              }}
            >
              <div
                className="w-full h-full max-w-40 max-h-40 [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: icon.svgCode }}
              />
            </div>

            {/* Thông tin */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
                {icon.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs font-semibold bg-jade-50 text-jade-900 px-3 py-1 rounded-full">
                  {categoryLabel}
                </span>
                {(icon.tags ?? []).map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold bg-gray-100 text-gray-500 px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Thẻ tác giả */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-jade-900 text-white flex items-center justify-center text-sm font-bold overflow-hidden uppercase shrink-0">
                  {author?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={author.avatarUrl}
                      alt={authorDisplayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    authorDisplayName.charAt(0)
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    Tạo bởi{" "}
                    {author ? (
                      <Link
                        href={`/u/${author.username}`}
                        className="text-jade-700 font-semibold hover:underline"
                      >
                        @{author.username}
                      </Link>
                    ) : (
                      <span className="font-semibold">
                        {authorDisplayName}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    Ngày tạo: {createdDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-3">
                <IconLikeButton
                  iconId={String(icon._id)}
                  initialLikedBy={(icon.likedBy ?? []).map((uid: unknown) =>
                    String(uid)
                  )}
                  currentUserId={currentUserId}
                />
                <AddToCollectionButton
                  iconId={String(icon._id)}
                  currentUserId={currentUserId}
                />
                <ReportButton
                  targetType="icon"
                  targetId={String(icon._id)}
                  currentUserId={currentUserId}
                  label="Báo cáo icon"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bảng Export Code full-width bên dưới */}
        <div className="mt-8 animate-fade-in-up">
          <IconExportCode
            name={icon.name}
            svgCode={icon.svgCode}
            size={icon.size ?? 120}
          />
        </div>

        {/* Khu vực bình luận */}
        <IconComments iconId={String(icon._id)} currentUserId={currentUserId} />
      </div>
    </main>
  );
}
