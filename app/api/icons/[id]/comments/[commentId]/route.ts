import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";
import Comment from "../../../../../../models/Comment";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../../../lib/auth";

// DELETE /api/icons/:id/comments/:commentId -> xoá bình luận (chỉ chủ bình luận được xoá)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);

    if (!userId) {
      return NextResponse.json(
        { message: "Vui lòng đăng nhập." },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { commentId } = await params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return NextResponse.json(
        { message: "Không tìm thấy bình luận." },
        { status: 404 }
      );
    }

    if (comment.authorId.toString() !== userId) {
      return NextResponse.json(
        { message: "Bạn không có quyền xoá bình luận này." },
        { status: 403 }
      );
    }

    await comment.deleteOne();

    return NextResponse.json({ message: "Đã xoá bình luận." }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Xoá bình luận:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
