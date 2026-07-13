import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import Icon from "../../../../../models/Icon";
import User from "../../../../../models/User";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../../lib/auth";
import { createNotification } from "../../../../../lib/notify";

// POST /api/icons/:id/like -> bật/tắt yêu thích icon cho tài khoản đang đăng nhập
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);

    if (!userId) {
      return NextResponse.json(
        { message: "Vui lòng đăng nhập để yêu thích icon." },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { id } = await params;
    const icon = await Icon.findById(id);

    if (!icon) {
      return NextResponse.json(
        { message: "Không tìm thấy icon." },
        { status: 404 }
      );
    }

    const alreadyLiked = icon.likedBy.some(
      (u: { toString: () => string }) => u.toString() === userId
    );

    if (alreadyLiked) {
      icon.likedBy = icon.likedBy.filter(
        (u: { toString: () => string }) => u.toString() !== userId
      );
    } else {
      icon.likedBy.push(userId);
    }

    await icon.save();

    // Chỉ thông báo khi vừa được THÍCH (không thông báo khi bỏ thích),
    // và không tự thông báo cho chính chủ icon khi tự thích icon của mình
    if (!alreadyLiked && icon.authorId && icon.authorId.toString() !== userId) {
      const liker = await User.findById(userId).select("name");
      if (liker) {
        await createNotification({
          recipientId: icon.authorId.toString(),
          type: "like",
          message: `${liker.name} đã thích icon "${icon.name}" của bạn.`,
          link: `/icon/${icon._id}`,
        });
      }
    }

    return NextResponse.json(
      { liked: !alreadyLiked, likesCount: icon.likedBy.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lỗi API Yêu thích Icon:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
