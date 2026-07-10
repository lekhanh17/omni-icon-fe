"use client";

import { useState } from "react";
import {
  svgToHtmlImg,
  svgToReact,
  svgToVue,
  toPascalCase,
} from "../../../lib/exportCode";

type ExportFormat = "svg" | "html" | "react" | "vue";

interface LikeButtonProps {
  iconId: string;
  initialLikedBy: string[];
  currentUserId?: string;
}

// Nút Yêu thích (đặt trong cột thông tin bên phải)
export function IconLikeButton({
  iconId,
  initialLikedBy,
  currentUserId,
}: LikeButtonProps) {
  const [likedBy, setLikedBy] = useState(initialLikedBy);
  const [loginHint, setLoginHint] = useState(false);

  const likedByMe = !!currentUserId && likedBy.includes(currentUserId);
  const likesCount = likedBy.length;

  const handleToggleLike = async () => {
    setLoginHint(false);
    const wasLiked = likedByMe;

    // Cập nhật lạc quan trên giao diện trước, hoàn tác nếu server báo lỗi
    setLikedBy((prev) =>
      wasLiked
        ? prev.filter((id) => id !== currentUserId)
        : [...prev, currentUserId as string]
    );

    try {
      const res = await fetch(`/api/icons/${iconId}/like`, {
        method: "POST",
      });

      if (res.status === 401) {
        setLoginHint(true);
        setLikedBy(initialLikedBy);
        return;
      }

      if (!res.ok) {
        setLikedBy(initialLikedBy);
      }
    } catch {
      setLikedBy(initialLikedBy);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleToggleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm transition-colors ${
          likedByMe
            ? "bg-red-50 border-red-200 text-red-500"
            : "bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-400"
        }`}
      >
        <span>{likedByMe ? "♥" : "♡"}</span>
        <span>{likesCount} lượt thích</span>
      </button>
      {loginHint && (
        <p className="text-xs text-red-500">Đăng nhập để yêu thích icon</p>
      )}
    </div>
  );
}

interface ExportCodeProps {
  name: string;
  svgCode: string;
  size: number;
}

// Bảng xuất Code nhiều định dạng (đặt full-width bên dưới)
export function IconExportCode({ name, svgCode, size }: ExportCodeProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>("svg");
  const [copied, setCopied] = useState(false);

  const componentName = toPascalCase(name);
  const codeByFormat: Record<ExportFormat, string> = {
    svg: svgCode,
    html: svgToHtmlImg(svgCode, size, name),
    react: svgToReact(svgCode, componentName),
    vue: svgToVue(svgCode),
  };
  const activeCode = codeByFormat[exportFormat];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
          Export Code
        </h2>
        <button
          onClick={handleCopy}
          className="text-xs bg-jade-900 hover:bg-jade-700 text-white px-3 py-1.5 rounded transition-colors font-semibold"
        >
          {copied ? "Đã copy!" : `Copy ${exportFormat.toUpperCase()}`}
        </button>
      </div>

      <div className="flex gap-1 mb-4">
        {(["svg", "html", "react", "vue"] as const).map((fmt) => (
          <button
            key={fmt}
            type="button"
            onClick={() => setExportFormat(fmt)}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase transition-colors ${
              exportFormat === fmt
                ? "bg-jade-900 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {fmt}
          </button>
        ))}
      </div>

      <pre className="text-gray-300 text-xs font-mono overflow-x-auto p-4 bg-gray-900 rounded-lg border border-gray-700 max-h-96">
        <code>{activeCode}</code>
      </pre>
    </div>
  );
}
