"use client";

import { useEffect, useRef, useState } from "react";

type Role = "user" | "staff" | "admin";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  username?: string;
  role: Role;
  isBanned: boolean;
  createdAt: string;
}

interface Props {
  users: UserRow[];
}

const ROLE_LABEL: Record<Role, string> = {
  user: "User",
  staff: "Staff",
  admin: "Admin",
};

const ROLE_BADGE_CLASS: Record<Role, string> = {
  user: "bg-gray-100 text-gray-500",
  staff: "bg-jade-200/60 text-jade-900",
  admin: "bg-jade-900 text-white",
};

// Dropdown chọn vai trò tự dựng bằng Tailwind - thay cho thẻ <select> gốc vì
// danh sách xổ xuống của <select> do trình duyệt/hệ điều hành vẽ, không style được.
function RoleDropdown({
  value,
  disabled,
  onChange,
}: {
  value: Role;
  disabled: boolean;
  onChange: (role: Role) => void;
}) {
  const [open, setOpen] = useState(false);
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

  return (
    <div ref={boxRef} className="relative inline-block text-left">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-semibold border border-gray-200 rounded-lg pl-3 pr-2 py-1.5 text-gray-700 bg-white hover:border-jade-300 disabled:opacity-40 transition-colors"
      >
        {ROLE_LABEL[value]}
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg divide-y divide-gray-100">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              if (value !== "user") onChange("user");
            }}
            className={`block w-full text-left px-3 py-2 text-xs font-semibold ${
              value === "user" ? "bg-jade-50 text-jade-900" : "text-gray-600"
            }`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              if (value !== "staff") onChange("staff");
            }}
            className={`block w-full text-left px-3 py-2 text-xs font-semibold ${
              value === "staff" ? "bg-jade-50 text-jade-900" : "text-gray-600"
            }`}
          >
            Staff
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              if (value !== "admin") onChange("admin");
            }}
            className={`block w-full text-left px-3 py-2 text-xs font-semibold ${
              value === "admin" ? "bg-jade-50 text-jade-900" : "text-gray-600"
            }`}
          >
            Admin
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersTable({ users: initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const updateUser = async (
    id: string,
    patch: Partial<Pick<UserRow, "role" | "isBanned">>
  ) => {
    setPendingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không thể cập nhật người dùng.");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, ...data.user } : u))
      );
    } catch {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {error && (
        <p className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
          {error}
        </p>
      )}
      <div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 rounded-tl-2xl">Người dùng</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Vai trò</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3 text-right rounded-tr-2xl">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-gray-100">
                <td className="px-5 py-3">
                  <p className="font-semibold text-gray-800">{u.name}</p>
                  {u.username && (
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-600">{u.email}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${ROLE_BADGE_CLASS[u.role]}`}
                  >
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {u.isBanned ? (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-50 text-red-600">
                      Đã khoá
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-jade-50 text-jade-900">
                      Hoạt động
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-3">
                    <RoleDropdown
                      value={u.role}
                      disabled={pendingId === u._id}
                      onChange={(role) => updateUser(u._id, { role })}
                    />
                    <button
                      type="button"
                      disabled={pendingId === u._id}
                      onClick={() =>
                        updateUser(u._id, { isBanned: !u.isBanned })
                      }
                      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-40"
                    >
                      {u.isBanned ? "Mở khoá" : "Khoá"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
