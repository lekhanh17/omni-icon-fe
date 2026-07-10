"use client";

import { useState } from "react";
import Link from "next/link";

interface IconRow {
  _id: string;
  name: string;
  authorName?: string;
  category?: string;
  svgCode: string;
  createdAt: string;
}

interface Props {
  icons: IconRow[];
}

export default function AdminIconsTable({ icons: initialIcons }: Props) {
  const [icons, setIcons] = useState(initialIcons);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm("Xoá icon này? Hành động không thể hoàn tác.")) return;

    setPendingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/icons/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Không thể xoá icon.");
        return;
      }
      setIcons((prev) => prev.filter((i) => i._id !== id));
    } catch {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setPendingId(null);
    }
  };

  if (icons.length === 0) {
    return <p className="text-center text-gray-400 py-16">Chưa có icon nào.</p>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {error && (
        <p className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
          {error}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3">Icon</th>
              <th className="px-5 py-3">Tác giả</th>
              <th className="px-5 py-3">Danh mục</th>
              <th className="px-5 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {icons.map((icon) => (
              <tr key={icon._id} className="border-t border-gray-100">
                <td className="px-5 py-3">
                  <Link
                    href={`/icon/${icon._id}`}
                    className="flex items-center gap-3 hover:text-jade-700 transition-colors"
                  >
                    <div
                      className="w-8 h-8 shrink-0 [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: icon.svgCode }}
                    />
                    <span className="font-semibold text-gray-800">
                      {icon.name}
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {icon.authorName || "Ẩn danh"}
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {icon.category || "-"}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    disabled={pendingId === icon._id}
                    onClick={() => handleDelete(icon._id)}
                    className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-40"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
