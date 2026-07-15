"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  targetUserId: string;
  currentUserId?: string;
  initialFollowing: boolean;
}

// Nút Theo dõi / Đang theo dõi trên trang cá nhân công khai
export default function FollowButton({
  targetUserId,
  currentUserId,
  initialFollowing,
}: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  if (!currentUserId) {
    return (
      <Link
        href="/login"
        className="text-sm font-semibold bg-jade-900 text-white px-6 py-2 rounded-full hover:bg-jade-700 transition-colors"
      >
        Đăng nhập để theo dõi
      </Link>
    );
  }

  const handleToggle = async () => {
    const prevFollowing = following;
    setFollowing(!prevFollowing);
    setLoading(true);

    try {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setFollowing(data.following);
      } else {
        setFollowing(prevFollowing);
      }
    } catch {
      setFollowing(prevFollowing);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`text-sm font-semibold px-6 py-2 rounded-full transition-colors disabled:opacity-50 ${
        following
          ? "text-gray-600 border border-gray-300 hover:border-red-300 hover:text-red-500"
          : "bg-jade-900 text-white hover:bg-jade-700"
      }`}
    >
      {following ? "Đang theo dõi" : "+ Theo dõi"}
    </button>
  );
}
