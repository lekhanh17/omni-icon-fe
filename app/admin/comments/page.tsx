import { connectToDatabase } from "../../../lib/db";
import Comment from "../../../models/Comment";
import AdminCommentsTable from "./AdminCommentsTable";
import AdminDateFilter from "../AdminDateFilter";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

// Danh sách bình luận: lọc theo khoảng ngày, kiểm duyệt và xoá bình luận vi phạm
export default async function AdminCommentsPage({ searchParams }: PageProps) {
  const { from, to } = await searchParams;

  await connectToDatabase();

  const createdAtFilter: Record<string, Date> = {};
  if (from) createdAtFilter.$gte = new Date(`${from}T00:00:00`);
  if (to) createdAtFilter.$lte = new Date(`${to}T23:59:59.999`);

  const query = Object.keys(createdAtFilter).length > 0 ? { createdAt: createdAtFilter } : {};

  const comments = await Comment.find(query).sort({ createdAt: -1 }).limit(200);

  return (
    <div className="flex flex-col gap-5">
      <AdminDateFilter basePath="/admin/comments" from={from} to={to} />
      <AdminCommentsTable comments={JSON.parse(JSON.stringify(comments))} />
    </div>
  );
}
