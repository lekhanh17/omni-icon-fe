"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Profile {
  _id: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

const AVATAR_SIZE = 256;

// Đọc file ảnh, cắt vuông giữa ảnh rồi thu nhỏ về AVATAR_SIZE, xuất ra base64 (JPEG)
function resizeImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new window.Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Không thể xử lý ảnh."));
          return;
        }

        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };

      img.onerror = () => reject(new Error("File ảnh không hợp lệ."));
      img.src = reader.result as string;
    };

    reader.onerror = () => reject(new Error("Không đọc được file ảnh."));
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/me");

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        const data = await res.json();

        if (res.ok) {
          setProfile(data.user);
          setName(data.user.name);
          setUsername(data.user.username ?? "");
          setBio(data.user.bio ?? "");
          setAvatarPreview(data.user.avatarUrl ?? "");

          // Tự chữa localStorage nếu đang thiếu avatarUrl (vd: đổi ảnh ở phiên trước
          // nhưng lúc đó chưa đồng bộ), để Header hiển thị đúng ngay khi vào trang này
          const stored = localStorage.getItem("user");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed.avatarUrl !== data.user.avatarUrl) {
                localStorage.setItem(
                  "user",
                  JSON.stringify({
                    ...parsed,
                    name: data.user.name,
                    avatarUrl: data.user.avatarUrl,
                  })
                );
                window.dispatchEvent(new Event("storage"));
              }
            } catch {
              // Bỏ qua nếu dữ liệu localStorage bị hỏng
            }
          }
        } else {
          setError(data.message || "Không thể tải thông tin tài khoản.");
        }
      } catch {
        setError("Không thể kết nối đến máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const resized = await resizeImageToBase64(file);
      setAvatarPreview(resized);
    } catch {
      setError("Không thể xử lý ảnh vừa chọn, hãy thử ảnh khác.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Họ và tên không được để trống.");
      return;
    }

    if (newPassword && newPassword !== confirmNewPassword) {
      setError("Mật khẩu mới xác nhận không khớp.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          bio,
          avatarUrl: avatarPreview,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Cập nhật thất bại.");
        return;
      }

      setProfile((prev) => (prev ? { ...prev, ...data.user } : prev));
      setUsername(data.user.username ?? "");
      setSuccess("Đã lưu thay đổi!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      // Đồng bộ lại localStorage để Header hiển thị đúng tên/ảnh mới ngay lập tức
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsed,
              name: data.user.name,
              avatarUrl: data.user.avatarUrl,
            })
          );
          window.dispatchEvent(new Event("storage"));
        } catch {
          // Bỏ qua nếu dữ liệu localStorage bị hỏng
        }
      }
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-gray-400">Đang tải thông tin tài khoản...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-jade-200/60">
        <h2 className="text-3xl font-extrabold text-jade-900 tracking-tight mb-8 text-center">
          Thông tin cá nhân
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Ảnh đại diện */}
          <div className="flex flex-col items-center mb-2">
            <div className="w-24 h-24 rounded-full bg-jade-900 text-white flex items-center justify-center text-2xl font-bold shadow-sm mb-3 overflow-hidden uppercase">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt="Ảnh đại diện"
                  className="w-full h-full object-cover"
                />
              ) : (
                name.charAt(0) || "?"
              )}
            </div>
            <label className="text-sm font-semibold text-jade-700 hover:text-jade-500 cursor-pointer transition-colors">
              Đổi ảnh đại diện
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile?.email ?? ""}
              disabled
              className="w-full px-5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên người dùng (username)
            </label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-jade-500 focus-within:border-jade-500">
              <span className="pl-5 text-gray-400 select-none">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ten_nguoi_dung"
                className="w-full px-2 py-3 bg-transparent focus:outline-none text-gray-900"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Chữ thường, số, dấu gạch dưới, 3-20 ký tự. Dùng để tạo link
              trang cá nhân công khai.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tiểu sử
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Giới thiệu ngắn về bạn..."
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500 text-gray-900 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1.5 text-right">
              {bio.length}/200
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Đổi mật khẩu (bỏ trống nếu không muốn đổi)
            </p>

            <div className="space-y-3">
              <input
                type="password"
                placeholder="Mật khẩu hiện tại"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500 text-gray-900"
              />
              <input
                type="password"
                placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500 text-gray-900"
              />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500 text-gray-900"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg font-medium">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-jade-50 border-l-4 border-jade-500 text-jade-900 text-sm rounded-r-lg font-medium">
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex justify-center py-3.5 px-4 mt-2 rounded-xl shadow-sm text-sm font-bold text-white bg-jade-900 hover:bg-jade-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>

          {profile?.username && (
            <Link
              href={`/u/${profile.username}`}
              target="_blank"
              className="block text-center text-sm font-semibold text-jade-700 hover:text-jade-500 transition-colors pt-2"
            >
              Xem trang cá nhân công khai của bạn →
            </Link>
          )}
        </form>
      </div>
    </main>
  );
}
