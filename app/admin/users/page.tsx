import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectToDatabase } from "../../../lib/db";
import User from "../../../models/User";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../lib/auth";
import AdminUsersTable from "./AdminUsersTable";

// Danh sách người dùng: đổi vai trò (user/staff/admin), khoá/mở khoá tài khoản.
// Chỉ admin được vào trang này - staff bị chuyển hướng ra dù có gõ thẳng URL.
export default async function AdminUsersPage() {
  await connectToDatabase();

  const cookieStore = await cookies();
  const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const currentUser = userId ? await User.findById(userId).select("role") : null;

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/admin");
  }

  const users = await User.find()
    .select("name email username role isBanned createdAt")
    .sort({ createdAt: -1 });

  return <AdminUsersTable users={JSON.parse(JSON.stringify(users))} />;
}
