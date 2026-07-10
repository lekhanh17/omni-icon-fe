"use client";

import { useEffect, useState } from "react";

export interface IconGridItem {
  _id: string;
  name: string;
  svgCode: string;
  likedBy?: string[];
}

interface IconGridProps {
  icons: IconGridItem[];
  currentUserId?: string;
  emptyMessage?: string;
}

// Lưới icon dùng chung cho Thư viện, Trang cá nhân công khai và Icon yêu thích:
// hiển thị preview, nút Copy SVG và nút Yêu thích (❤) kèm số lượt thích.
export default function IconGrid({
  icons,
  currentUserId,
  emptyMessage = "Chưa có icon nào.",
}: IconGridProps) {
  const [items, setItems] = useState(icons);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loginHintId, setLoginHintId] = useState<string | null>(null);

  // Đồng bộ lại khi trang cha fetch dữ liệu mới (vd: đổi từ khóa tìm kiếm)
  useEffect(() => {
    setItems(icons);
  }, [icons]);

  const handleCopy = (icon: IconGridItem) => {
    navigator.clipboard.writeText(icon.svgCode);
    setCopiedId(icon._id);
    setTimeout(
      () => setCopiedId((prev) => (prev === icon._id ? null : prev)),
      1500
    );
  };

  const handleToggleLike = async (icon: IconGridItem) => {
    setLoginHintId(null);
    const isLiked =
      !!currentUserId && (icon.likedBy ?? []).includes(currentUserId);

    // Cập nhật lạc quan trên giao diện trước, hoàn tác nếu server báo lỗi
    setItems((prev) =>
      prev.map((it) => {
        if (it._id !== icon._id) return it;
        const nextLikedBy = isLiked
          ? (it.likedBy ?? []).filter((id) => id !== currentUserId)
          : [...(it.likedBy ?? []), currentUserId as string];
        return { ...it, likedBy: nextLikedBy };
      })
    );

    try {
      const res = await fetch(`/api/icons/${icon._id}/like`, {
        method: "POST",
      });

      if (res.status === 401) {
        setLoginHintId(icon._id);
        setItems((prev) => prev.map((it) => (it._id === icon._id ? icon : it)));
        return;
      }

      if (!res.ok) {
        setItems((prev) => prev.map((it) => (it._id === icon._id ? icon : it)));
      }
    } catch {
      setItems((prev) => prev.map((it) => (it._id === icon._id ? icon : it)));
    }
  };

  if (items.length === 0) {
    return <p className="text-center text-gray-400 py-16">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {items.map((icon, index) => {
        const likesCount = icon.likedBy?.length ?? 0;
        const likedByMe =
          !!currentUserId && (icon.likedBy ?? []).includes(currentUserId);

        return (
          <div
            key={icon._id}
            style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
            className="animate-fade-in-up bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-jade-200 hover:-translate-y-0.5 transition-all p-5 flex flex-col items-center"
          >
            <div
              className="w-16 h-16 flex items-center justify-center mb-4 [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: icon.svgCode }}
            />
            <p className="text-sm font-semibold text-gray-800 text-center truncate w-full mb-1">
              {icon.name}
            </p>

            <button
              type="button"
              onClick={() => handleToggleLike(icon)}
              className={`flex items-center gap-1 text-xs mb-3 transition-colors ${
                likedByMe
                  ? "text-red-500"
                  : "text-gray-400 hover:text-red-400"
              }`}
            >
              <span>{likedByMe ? "♥" : "♡"}</span>
              <span>{likesCount}</span>
            </button>

            {loginHintId === icon._id && (
              <p className="text-[11px] text-red-500 mb-2 text-center">
                Đăng nhập để yêu thích icon
              </p>
            )}

            <button
              type="button"
              onClick={() => handleCopy(icon)}
              className="text-xs bg-jade-50 hover:bg-jade-200/60 text-jade-900 px-3 py-1.5 rounded-full font-semibold transition-colors w-full"
            >
              {copiedId === icon._id ? "Đã copy!" : "Copy SVG"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
