import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import Follow from "../../../../../models/Follow";
import User from "../../../../../models/User";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../../lib/auth";
import { createNotification } from "../../../../../lib/notify";

// POST /api/users/:id/follow -> bật/tắt theo dõi 1 người dùng khác
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);

    if (!userId) {
      return NextResponse.json(
        { message: "Vui lòng đăng nhập để theo dõi người dùng." },
        { status: 401 }
      );
    }

    const { id: targetId } = await params;

    if (targetId === userId) {
      return NextResponse.json(
        { message: "Bạn không thể tự theo dõi chính mình." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const targetUser = await User.findById(targetId).select("_id");
    if (!targetUser) {
      return NextResponse.json(
        { message: "Không tìm thấy người dùng." },
        { status: 404 }
      );
    }

    const existing = await Follow.findOne({
      followerId: userId,
      followingId: targetId,
    });

    let following: boolean;

    if (existing) {
      await Follow.deleteOne({ _id: existing._id });
      following = false;
    } else {
      await Follow.create({ followerId: userId, followingId: targetId });
      following = true;

      const follower = await User.findById(userId).select("name username");
      if (follower) {
        await createNotification({
          recipientId: targetId,
          type: "follow",
          message: `${follower.name} đã bắt đầu theo dõi bạn.`,
          link: follower.username ? `/u/${follower.username}` : "",
        });
      }
    }

    const followerCount = await Follow.countDocuments({ followingId: targetId });

    return NextResponse.json({ following, followerCount }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Theo dõi người dùng:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
