import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import Icon from "../../../../../models/Icon";
import Comment from "../../../../../models/Comment";
import { requireStaffOrAdmin } from "../../../../../lib/requireAdmin";

// DELETE /api/admin/icons/:id -> admin/staff xoá bất kỳ icon nào (kiểm duyệt nội dung)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await requireStaffOrAdmin(req);
    if (!check.ok) {
      return NextResponse.json({ message: check.message }, { status: check.status });
    }

    await connectToDatabase();
    const { id } = await params;

    const icon = await Icon.findByIdAndDelete(id);
    if (!icon) {
      return NextResponse.json(
        { message: "Không tìm thấy icon." },
        { status: 404 }
      );
    }

    // Dọn luôn bình luận thuộc icon đã xoá để tránh dữ liệu mồ côi
    await Comment.deleteMany({ iconId: id });

    return NextResponse.json({ message: "Đã xoá icon." }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Xoá icon (admin):", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
