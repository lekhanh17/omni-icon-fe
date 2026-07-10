import Link from "next/link";
import { connectToDatabase } from "../../lib/db";
import Icon from "../../models/Icon";
import User from "../../models/User";

interface LeaderRow {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string;
  iconCount: number;
}

export default async function LeaderboardPage() {
  await connectToDatabase();

  const aggregated = await Icon.aggregate([
    { $match: { authorId: { $ne: null } } },
    { $group: { _id: "$authorId", iconCount: { $sum: 1 } } },
    { $sort: { iconCount: -1 } },
    { $limit: 20 },
  ]);

  const userIds = aggregated.map((row) => row._id);
  const users = await User.find({ _id: { $in: userIds } }).select(
    "name username avatarUrl"
  );
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const rows: LeaderRow[] = aggregated
    .map((row) => {
      const user = userMap.get(row._id.toString());
      if (!user) return null;
      return {
        userId: row._id.toString(),
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        iconCount: row.iconCount,
      };
    })
    .filter((row): row is LeaderRow => row !== null);

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16 bg-gray-50 w-full">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold text-jade-900 mb-3 text-center animate-fade-in-up">
          Bảng xếp hạng
        </h1>
        <p className="text-gray-600 text-center mb-10">
          Những người tạo nhiều icon nhất trên OmniIcon.
        </p>

        {rows.length === 0 ? (
          <p className="text-center text-gray-400 py-16">
            Chưa có dữ liệu xếp hạng.
          </p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {rows.map((row, index) => (
              <Link
                key={row.userId}
                href={row.username ? `/u/${row.username}` : "#"}
                className="flex items-center gap-4 p-4 hover:bg-jade-50/40 transition-colors"
              >
                <span
                  className={`w-8 text-center font-extrabold ${
                    index < 3 ? "text-jade-700" : "text-gray-300"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="w-10 h-10 rounded-full bg-jade-900 text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden uppercase shrink-0">
                  {row.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.avatarUrl}
                      alt={row.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    row.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {row.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    @{row.username}
                  </p>
                </div>
                <span className="text-sm font-bold text-jade-900 shrink-0">
                  {row.iconCount} icon
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
