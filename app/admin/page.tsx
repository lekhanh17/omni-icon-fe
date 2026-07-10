import { connectToDatabase } from "../../lib/db";
import Icon from "../../models/Icon";
import User from "../../models/User";
import Comment from "../../models/Comment";
import MonthlyChart, { MonthlyDataPoint } from "./MonthlyChart";

const MONTHS_TO_SHOW = 6;

interface MonthlyCountRow {
  _id: { y: number; m: number };
  count: number;
}

// Tổng quan: các số liệu chính + biểu đồ tăng trưởng theo tháng của toàn hệ thống
export default async function AdminDashboardPage() {
  await connectToDatabase();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Danh sách 6 tháng gần nhất (tính cả tháng hiện tại), từ cũ -> mới
  const now = new Date();
  const months = Array.from({ length: MONTHS_TO_SHOW }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS_TO_SHOW - 1 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: `Th${d.getMonth() + 1}/${d.getFullYear()}` };
  });
  const rangeStart = new Date(months[0].year, months[0].month - 1, 1);

  const [
    totalUsers,
    totalIcons,
    totalComments,
    totalAdmins,
    bannedUsers,
    iconsToday,
    usersToday,
    usersByMonth,
    iconsByMonth,
  ] = await Promise.all([
    User.countDocuments(),
    Icon.countDocuments(),
    Comment.countDocuments(),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ isBanned: true }),
    Icon.countDocuments({ createdAt: { $gte: startOfToday } }),
    User.countDocuments({ createdAt: { $gte: startOfToday } }),
    User.aggregate([
      { $match: { createdAt: { $gte: rangeStart } } },
      {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
    Icon.aggregate([
      { $match: { createdAt: { $gte: rangeStart } } },
      {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const userMap = new Map(
    (usersByMonth as MonthlyCountRow[]).map((r) => [`${r._id.y}-${r._id.m}`, r.count])
  );
  const iconMap = new Map(
    (iconsByMonth as MonthlyCountRow[]).map((r) => [`${r._id.y}-${r._id.m}`, r.count])
  );

  const chartData: MonthlyDataPoint[] = months.map((m) => ({
    label: m.label,
    users: userMap.get(`${m.year}-${m.month}`) ?? 0,
    icons: iconMap.get(`${m.year}-${m.month}`) ?? 0,
  }));

  const stats = [
    { label: "Tổng người dùng", value: totalUsers },
    { label: "Tổng icon", value: totalIcons },
    { label: "Tổng bình luận", value: totalComments },
    { label: "Quản trị viên", value: totalAdmins },
    { label: "Tài khoản bị khoá", value: bannedUsers },
    { label: "Icon tạo hôm nay", value: iconsToday },
    { label: "Người dùng mới hôm nay", value: usersToday },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
          >
            <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <MonthlyChart data={chartData} />
    </div>
  );
}
