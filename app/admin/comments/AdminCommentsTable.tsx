"use client";

import { useState } from "react";
import Link from "next/link";

interface CommentRow {
  _id: string;
  iconId: string;
  text: string;
  authorName: string;
  createdAt: string;
}

interface Props {
  comments: CommentRow[];
}

export default function AdminCommentsTable({ comments: initialComments }: Props) {
  const [comments, setComments] = useState(initialComments);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm("Xoá bình luận này?")) return;

    setPendingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Không thể xoá bình luận.");
        return;
      }
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setPendingId(null);
    }
  };

  if (comments.length === 0) {
    return (
      <p className="text-center text-gray-400 py-16">Chưa có bình luận nào.</p>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
      {error && (
        <p className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
          {error}
        </p>
      )}
      {comments.map((c) => (
        <div key={c._id} className="p-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm">
              <span className="font-semibold text-gray-800">
                {c.authorName}
              </span>{" "}
              <Link
                href={`/icon/${c.iconId}`}
                className="text-xs text-jade-700 hover:underline"
              >
                xem icon →
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap break-words">
              {c.text}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(c.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
          <button
            type="button"
            disabled={pendingId === c._id}
            onClick={() => handleDelete(c._id)}
            className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-40 shrink-0"
          >
            Xoá
          </button>
        </div>
      ))}
    </div>
  );
}
