"use client";

import { useState } from "react";
import Link from "next/link";

interface CollectionItem {
  _id: string;
  name: string;
  iconIds: string[];
  createdAt: string;
}

interface Props {
  initialCollections: CollectionItem[];
}

export default function CollectionsClient({ initialCollections }: Props) {
  const [collections, setCollections] = useState(initialCollections);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/me/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không thể tạo bộ sưu tập.");
        return;
      }

      setCollections((prev) => [data.collection, ...prev]);
      setNewName("");
    } catch {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Xoá bộ sưu tập này? Các icon bên trong vẫn còn nguyên trong Thư viện, chỉ bộ sưu tập bị xoá."
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/me/collections/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCollections((prev) => prev.filter((c) => c._id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="flex gap-3 mb-10 max-w-md">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Tên bộ sưu tập mới..."
          maxLength={60}
          className="flex-1 px-5 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500 text-gray-900 shadow-sm"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="px-6 py-3 bg-jade-900 hover:bg-jade-700 disabled:opacity-50 text-white rounded-full font-semibold transition-colors shrink-0"
        >
          Tạo mới
        </button>
      </form>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg max-w-md">
          ⚠️ {error}
        </div>
      )}

      {collections.length === 0 ? (
        <p className="text-center text-gray-400 py-16">
          Bạn chưa có bộ sưu tập nào. Tạo bộ sưu tập đầu tiên ở trên!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {collections.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col hover:shadow-md hover:border-jade-200 transition-all"
            >
              <Link href={`/collections/${c._id}`} className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                  {c.name}
                </h3>
                <p className="text-sm text-gray-400">{c.iconIds.length} icon</p>
              </Link>
              <button
                type="button"
                disabled={deletingId === c._id}
                onClick={() => handleDelete(c._id)}
                className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-40 mt-4 self-start"
              >
                Xoá bộ sưu tập
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
