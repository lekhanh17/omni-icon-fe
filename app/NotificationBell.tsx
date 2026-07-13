"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface NotificationItem {
  _id: string;
  type: "comment" | "like" | "report_resolved";
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

function TypeIcon({ type }: { type: NotificationItem["type"] }) {
  if (type === "like") {
    return (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
        />
      </svg>
    );
  }
  if (type === "comment") {
    return (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    );
  }
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

// Chuông thông báo ở Header - chỉ hiển thị khi đã đăng nhập
export default function NotificationBell() {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/me/notifications");
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Bỏ qua lỗi mạng, giữ nguyên dữ liệu cũ
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);

    if (next && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      try {
        await fetch("/api/me/notifications", { method: "PATCH" });
      } catch {
        // Bỏ qua lỗi mạng - lần mở dropdown sau sẽ đồng bộ lại
      }
    }
  };

  const handleItemClick = (n: NotificationItem) => {
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-jade-50/60 transition-colors"
        aria-label="Thông báo"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto animate-fade-in-up">
          <p className="px-4 py-3 text-sm font-bold text-gray-800 border-b border-gray-100">
            Thông báo
          </p>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">
              Chưa có thông báo nào.
            </p>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => handleItemClick(n)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-jade-50/60 transition-colors border-b border-gray-50 last:border-b-0 ${
                  !n.isRead ? "bg-jade-50/40" : ""
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-jade-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <TypeIcon type={n.type} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-gray-700 leading-snug">
                    {n.message}
                  </span>
                  <span className="block text-xs text-gray-400 mt-1">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </span>
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-jade-500 shrink-0 mt-2" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
