import { connectToDatabase } from "../../../lib/db";
import Icon from "../../../models/Icon";
import AdminIconsTable from "./AdminIconsTable";
import AdminDateFilter from "../AdminDateFilter";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

// Danh sách icon: lọc theo khoảng ngày tạo, kiểm duyệt và xoá icon vi phạm
export default async function AdminIconsPage({ searchParams }: PageProps) {
  const { from, to } = await searchParams;

  await connectToDatabase();

  const createdAtFilter: Record<string, Date> = {};
  if (from) createdAtFilter.$gte = new Date(`${from}T00:00:00`);
  if (to) createdAtFilter.$lte = new Date(`${to}T23:59:59.999`);

  const query = Object.keys(createdAtFilter).length > 0 ? { createdAt: createdAtFilter } : {};

  const icons = await Icon.find(query)
    .select("name authorName category svgCode createdAt")
    .sort({ createdAt: -1 })
    .limit(200);

  return (
    <div className="flex flex-col gap-5">
      <AdminDateFilter basePath="/admin/icons" from={from} to={to} />
      <AdminIconsTable icons={JSON.parse(JSON.stringify(icons))} />
    </div>
  );
}
