"use client";

import { useState } from "react";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  username?: string;
  role: "user" | "admin";
  isBanned: boolean;
  createdAt: string;
}

interface Props {
  users: UserRow[];
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
              <th className="px-5 py-3">Người dùng</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Vai trò</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3 text-right">Hành động</th>
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
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      u.role === "admin"
                        ? "bg-jade-900 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {u.role === "admin" ? "Admin" : "User"}
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
                  <button
                    type="button"
                    disabled={pendingId === u._id}
                    onClick={() =>
                      updateUser(u._id, {
                        role: u.role === "admin" ? "user" : "admin",
                      })
                    }
                    className="text-xs font-semibold text-jade-700 hover:underline disabled:opacity-40 mr-4"
                  >
                    {u.role === "admin" ? "Bỏ quyền admin" : "Cấp quyền admin"}
                  </button>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
