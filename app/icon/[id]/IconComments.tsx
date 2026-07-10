"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CommentItem {
  _id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: string;
}

interface Props {
  iconId: string;
  currentUserId?: string;
}

// Khu vực bình luận
export default function IconComments({ iconId, currentUserId }: Props) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/icons/${iconId}/comments`);
        const data = await res.json();
        if (!ignore && res.ok) {
          setComments(data.comments || []);
        }
      } catch {
        // Bỏ qua lỗi mạng
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchComments();
    return () => {
      ignore = true;
    };
  }, [iconId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/icons/${iconId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không thể gửi bình luận.");
        return;
      }

      setComments((prev) => [...prev, data.comment]);
      setText("");
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const prevComments = comments;
    setComments((prev) => prev.filter((c) => c._id !== commentId));

    try {
      const res = await fetch(`/api/icons/${iconId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setComments(prevComments);
      }
    } catch {
      setComments(prevComments);
    }
  };

  return (
    <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 animate-fade-in-up">
      <h2 className="text-lg font-bold text-gray-900 mb-6">
        Bình luận{comments.length > 0 ? ` (${comments.length})` : ""}
      </h2>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Viết bình luận..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500 text-sm text-gray-900 placeholder-gray-400 resize-none transition-colors"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-red-500">{error}</p>
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="text-sm bg-jade-900 hover:bg-jade-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-full font-semibold transition-colors shrink-0"
            >
              {submitting ? "Đang gửi..." : "Gửi bình luận"}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-500 mb-8">
          <Link
            href="/login"
            className="text-jade-700 font-semibold hover:underline"
          >
            Đăng nhập
          </Link>{" "}
          để để lại bình luận.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Đang tải bình luận...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400">
          Chưa có bình luận nào. Hãy là người đầu tiên!
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-jade-900 text-white flex items-center justify-center text-xs font-bold overflow-hidden uppercase shrink-0">
                {c.authorAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.authorAvatarUrl}
                    alt={c.authorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  c.authorName.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">
                    {c.authorName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("vi-VN", {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap wrap-break-word">
                  {c.text}
                </p>
              </div>
              {currentUserId === c.authorId && (
                <button
                  type="button"
                  onClick={() => handleDelete(c._id)}
                  className="text-xs text-gray-300 hover:text-red-500 transition-colors shrink-0"
                >
                  Xoá
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
