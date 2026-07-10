import { connectToDatabase } from "../../../lib/db";
import User from "../../../models/User";
import AdminUsersTable from "./AdminUsersTable";

// Danh sách người dùng: đổi vai trò (user/admin), khoá/mở khoá tài khoản
export default async function AdminUsersPage() {
  await connectToDatabase();
  const users = await User.find()
    .select("name email username role isBanned createdAt")
    .sort({ createdAt: -1 });

  return <AdminUsersTable users={JSON.parse(JSON.stringify(users))} />;
}
