"use client";

import { useState } from "react";
import Link from "next/link";

export interface ReportRow {
  _id: string;
  targetType: "icon" | "comment";
  targetId: string;
  reporterName: string;
  reason: string;
  createdAt: string;
  targetExists: boolean;
  targetName?: string;
  targetSvgCode?: string;
  targetText?: string;
  targetIconId?: string;
}

interface Props {
  reports: ReportRow[];
}

// Hàng đợi báo cáo vi phạm: xem nội dung bị báo cáo, xoá luôn hoặc bỏ qua
export default function AdminReportsTable({ reports: initialReports }: Props) {
  const [reports, setReports] = useState(initialReports);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleAction = async (id: string, action: "delete_target" | "dismiss") => {
    if (
      action === "delete_target" &&
      !confirm("Xoá nội dung vi phạm này? Hành động không thể hoàn tác.")
    ) {
      return;
    }

    setPendingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Không thể xử lý báo cáo.");
        return;
      }
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setPendingId(null);
    }
  };

  if (reports.length === 0) {
    return (
      <p className="text-center text-gray-400 py-16">
        Không có báo cáo nào đang chờ xử lý.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="p-3 text-sm text-red-600 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          {error}
        </p>
      )}
      {reports.map((r) => (
        <div
          key={r._id}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                {r.targetType === "icon" ? "Icon" : "Bình luận"}
              </span>
              <span className="text-xs text-gray-400">
                báo cáo bởi{" "}
                <span className="font-semibold text-gray-600">
                  {r.reporterName}
                </span>{" "}
                · {new Date(r.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>

            {!r.targetExists ? (
              <p className="text-sm text-gray-400 italic">
                Nội dung này đã bị xoá trước đó.
              </p>
            ) : r.targetType === "icon" ? (
              <Link
                href={`/icon/${r.targetId}`}
                className="flex items-center gap-3 hover:text-jade-700 transition-colors w-fit"
              >
                <div
                  className="w-8 h-8 shrink-0 [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: r.targetSvgCode || "" }}
                />
                <span className="font-semibold text-gray-800">{r.targetName}</span>
              </Link>
            ) : (
              <div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap wrap-break-word">
                  {r.targetText}
                </p>
                {r.targetIconId && (
                  <Link
                    href={`/icon/${r.targetIconId}`}
                    className="text-xs text-jade-700 hover:underline"
                  >
                    xem icon →
                  </Link>
                )}
              </div>
            )}

            {r.reason && (
              <p className="text-xs text-gray-500 mt-2">
                Lý do: <span className="italic">&quot;{r.reason}&quot;</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {r.targetExists && (
              <button
                type="button"
                disabled={pendingId === r._id}
                onClick={() => handleAction(r._id, "delete_target")}
                className="text-xs font-semibold text-white bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-full disabled:opacity-40 transition-colors"
              >
                Xoá nội dung
              </button>
            )}
            <button
              type="button"
              disabled={pendingId === r._id}
              onClick={() => handleAction(r._id, "dismiss")}
              className="text-xs font-semibold text-gray-500 hover:underline disabled:opacity-40"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
