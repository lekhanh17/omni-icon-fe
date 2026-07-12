import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import Report from "../../../../../models/Report";
import Icon from "../../../../../models/Icon";
import Comment from "../../../../../models/Comment";
import { requireStaffOrAdmin } from "../../../../../lib/requireAdmin";

// PATCH /api/admin/reports/:id -> xử lý 1 báo cáo: xoá nội dung vi phạm hoặc bỏ qua báo cáo
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await requireStaffOrAdmin(req);
    if (!check.ok) {
      return NextResponse.json({ message: check.message }, { status: check.status });
    }

    const { action } = await req.json();
    if (action !== "delete_target" && action !== "dismiss") {
      return NextResponse.json(
        { message: "Hành động không hợp lệ." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const { id } = await params;

    const report = await Report.findById(id);
    if (!report) {
      return NextResponse.json(
        { message: "Không tìm thấy báo cáo." },
        { status: 404 }
      );
    }

    if (action === "dismiss") {
      report.status = "dismissed";
      await report.save();
      return NextResponse.json({ report }, { status: 200 });
    }

    // action === "delete_target": xoá icon/bình luận bị báo cáo
    if (report.targetType === "icon") {
      await Icon.findByIdAndDelete(report.targetId);
      await Comment.deleteMany({ iconId: report.targetId });
    } else {
      await Comment.findByIdAndDelete(report.targetId);
    }

    // Các báo cáo khác cùng trỏ tới nội dung này cũng coi như đã xử lý xong
    await Report.updateMany(
      { targetType: report.targetType, targetId: report.targetId, status: "pending" },
      { status: "resolved" }
    );

    report.status = "resolved";
    await report.save();

    return NextResponse.json({ report }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Xử lý báo cáo:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
