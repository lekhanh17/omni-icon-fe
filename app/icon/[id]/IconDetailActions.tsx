"use client";

import { useEffect, useRef, useState } from "react";
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

interface ReportButtonProps {
  targetType: "icon" | "comment";
  targetId: string;
  currentUserId?: string;
  label?: string;
}

// Nút Báo cáo vi phạm dùng chung cho icon và bình luận - chỉ hiện khi đã đăng nhập
export function ReportButton({
  targetType,
  targetId,
  currentUserId,
  label,
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUserId) return null;

  if (done) {
    return (
      <span className="text-xs text-gray-400">Đã gửi báo cáo, cảm ơn bạn!</span>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason: reason.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không thể gửi báo cáo.");
        return;
      }

      setDone(true);
      setOpen(false);
    } catch {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={boxRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
      >
        {label ?? "Báo cáo"}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 right-0 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-4 animate-fade-in-up">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Báo cáo vi phạm
          </p>
          <form onSubmit={handleSubmit}>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Lý do (không bắt buộc)..."
              rows={2}
              maxLength={300}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 px-3 py-1.5 rounded-full transition-colors"
              >
                {submitting ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

interface CollectionSummary {
  _id: string;
  name: string;
  iconIds: string[];
}

interface AddToCollectionProps {
  iconId: string;
  currentUserId?: string;
}

// Nút "Thêm vào bộ sưu tập" - tải danh sách bộ sưu tập của chính mình, cho chọn hoặc tạo mới
export function AddToCollectionButton({
  iconId,
  currentUserId,
}: AddToCollectionProps) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<CollectionSummary[] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/me/collections");
      const data = await res.json();
      if (res.ok) setCollections(data.collections || []);
    } catch {
      setError("Không thể tải danh sách bộ sưu tập.");
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = () => {
    setOpen((o) => {
      const next = !o;
      if (next && collections === null) loadCollections();
      return next;
    });
  };

  const handleAdd = async (collectionId: string) => {
    setError("");
    try {
      const res = await fetch(`/api/me/collections/${collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addIconId: iconId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không thể thêm vào bộ sưu tập.");
        return;
      }

      setAddedId(collectionId);
      setCollections((prev) =>
        prev
          ? prev.map((c) => (c._id === collectionId ? data.collection : c))
          : prev
      );
    } catch {
      setError("Không thể kết nối đến máy chủ.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/me/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), iconId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không thể tạo bộ sưu tập.");
        return;
      }

      setCollections((prev) =>
        prev ? [data.collection, ...prev] : [data.collection]
      );
      setAddedId(data.collection._id);
      setNewName("");
    } catch {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setCreating(false);
    }
  };

  if (!currentUserId) return null;

  return (
    <div ref={boxRef} className="relative inline-block">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-500 hover:border-jade-300 hover:text-jade-700 font-semibold text-sm transition-colors"
      >
        + Bộ sưu tập
      </button>

      {open && (
        <div className="absolute z-20 mt-2 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-3 animate-fade-in-up">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 px-1">
            Thêm vào bộ sưu tập
          </p>

          {loading ? (
            <p className="text-xs text-gray-400 px-1 py-2">Đang tải...</p>
          ) : collections && collections.length > 0 ? (
            <div className="max-h-40 overflow-y-auto flex flex-col gap-1 mb-2">
              {collections.map((c) => {
                const isIn = c.iconIds.includes(iconId) || addedId === c._id;
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => !isIn && handleAdd(c._id)}
                    disabled={isIn}
                    className={`text-left text-xs px-2 py-2 rounded-lg transition-colors ${
                      isIn
                        ? "bg-jade-50 text-jade-900 cursor-default"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {isIn ? "✓ " : ""}
                    {c.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 px-1 py-2">
              Chưa có bộ sưu tập nào.
            </p>
          )}

          {error && <p className="text-[11px] text-red-500 px-1 mb-1">{error}</p>}

          <form
            onSubmit={handleCreate}
            className="flex gap-1.5 border-t border-gray-100 pt-2"
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tạo bộ sưu tập mới..."
              maxLength={60}
              className="flex-1 min-w-0 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-jade-500"
            />
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="text-xs font-semibold text-white bg-jade-900 hover:bg-jade-700 disabled:opacity-40 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              Tạo
            </button>
          </form>
        </div>
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
