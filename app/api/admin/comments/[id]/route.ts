import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import Comment from "../../../../../models/Comment";
import { requireAdmin } from "../../../../../lib/requireAdmin";

// DELETE /api/admin/comments/:id -> admin xoá bất kỳ bình luận nào (kiểm duyệt nội dung)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await requireAdmin(req);
    if (!check.ok) {
      return NextResponse.json({ message: check.message }, { status: check.status });
    }

    await connectToDatabase();
    const { id } = await params;

    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) {
      return NextResponse.json(
        { message: "Không tìm thấy bình luận." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Đã xoá bình luận." }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Xoá bình luận (admin):", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
