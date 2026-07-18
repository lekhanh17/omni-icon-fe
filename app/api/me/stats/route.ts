import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import Icon from "../../../../models/Icon";
import Comment from "../../../../models/Comment";
import Follow from "../../../../models/Follow";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth";

// GET /api/me/stats -> thống kê tổng quan của tài khoản đang đăng nhập
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
    }

    await connectToDatabase();

    const myIcons = await Icon.find({ authorId: userId }).select(
      "name svgCode likedBy category"
    );
    const iconIds = myIcons.map((icon) => icon._id);

    const [totalCommentsReceived, followerCount, followingCount, commentCounts] =
      await Promise.all([
        Comment.countDocuments({ iconId: { $in: iconIds } }),
        Follow.countDocuments({ followingId: userId }),
        Follow.countDocuments({ followerId: userId }),
        Comment.aggregate([
          { $match: { iconId: { $in: iconIds } } },
          { $group: { _id: "$iconId", count: { $sum: 1 } } },
        ]),
      ]);

    const commentCountMap = new Map<string, number>(
      commentCounts.map((c: { _id: unknown; count: number }) => [
        String(c._id),
        c.count,
      ])
    );

    const totalLikesReceived = myIcons.reduce(
      (sum, icon) => sum + (icon.likedBy?.length ?? 0),
      0
    );

    const topIcons = myIcons
      .map((icon) => {
        const likesCount = icon.likedBy?.length ?? 0;
        const commentsCount = commentCountMap.get(String(icon._id)) ?? 0;
        return {
          _id: icon._id,
          name: icon.name,
          svgCode: icon.svgCode,
          likesCount,
          commentsCount,
        };
      })
      .sort(
        (a, b) =>
          b.likesCount + b.commentsCount - (a.likesCount + a.commentsCount)
      )
      .slice(0, 5);

    // Phân bố icon theo danh mục
    const categoryBreakdown: Record<string, number> = {};
    for (const icon of myIcons) {
      categoryBreakdown[icon.category] =
        (categoryBreakdown[icon.category] ?? 0) + 1;
    }

    return NextResponse.json(
      {
        iconCount: myIcons.length,
        totalLikesReceived,
        totalCommentsReceived,
        followerCount,
        followingCount,
        topIcons,
        categoryBreakdown,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lỗi API Thống kê cá nhân:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
