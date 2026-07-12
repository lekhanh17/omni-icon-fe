import { connectToDatabase } from "../../../lib/db";
import Report from "../../../models/Report";
import Icon from "../../../models/Icon";
import Comment from "../../../models/Comment";
import AdminReportsTable, { ReportRow } from "./AdminReportsTable";

interface ReportDoc {
  _id: { toString(): string };
  targetType: "icon" | "comment";
  targetId: { toString(): string };
  reporterName: string;
  reason: string;
  createdAt: Date;
}

// Hàng đợi báo cáo vi phạm đang chờ xử lý (Staff/Admin đều xem được)
export default async function AdminReportsPage() {
  await connectToDatabase();

  const reports = (await Report.find({ status: "pending" })
    .sort({ createdAt: -1 })
    .limit(200)) as unknown as ReportDoc[];

  const iconIds = reports
    .filter((r) => r.targetType === "icon")
    .map((r) => r.targetId.toString());
  const commentIds = reports
    .filter((r) => r.targetType === "comment")
    .map((r) => r.targetId.toString());

  const [icons, comments] = await Promise.all([
    Icon.find({ _id: { $in: iconIds } }).select("name svgCode"),
    Comment.find({ _id: { $in: commentIds } }).select("text iconId"),
  ]);

  const iconMap = new Map(icons.map((i) => [String(i._id), i]));
  const commentMap = new Map(comments.map((c) => [String(c._id), c]));

  const rows: ReportRow[] = reports.map((r) => {
    const targetIdStr = r.targetId.toString();

    if (r.targetType === "icon") {
      const icon = iconMap.get(targetIdStr);
      return {
        _id: r._id.toString(),
        targetType: "icon",
        targetId: targetIdStr,
        reporterName: r.reporterName,
        reason: r.reason,
        createdAt: r.createdAt.toISOString(),
        targetExists: !!icon,
        targetName: icon?.name,
        targetSvgCode: icon?.svgCode,
      };
    }

    const comment = commentMap.get(targetIdStr);
    return {
      _id: r._id.toString(),
      targetType: "comment",
      targetId: targetIdStr,
      reporterName: r.reporterName,
      reason: r.reason,
      createdAt: r.createdAt.toISOString(),
      targetExists: !!comment,
      targetText: comment?.text,
      targetIconId: comment?.iconId ? String(comment.iconId) : undefined,
    };
  });

  return <AdminReportsTable reports={rows} />;
}
