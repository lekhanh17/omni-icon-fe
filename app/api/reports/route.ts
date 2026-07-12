import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db";
import Report from "../../../models/Report";
import Icon from "../../../models/Icon";
import Comment from "../../../models/Comment";
import User from "../../../models/User";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../lib/auth";

// POST /api/reports -> gửi báo cáo vi phạm cho 1 icon hoặc 1 bình luận (yêu cầu đăng nhập)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);

    if (!userId) {
      return NextResponse.json(
        { message: "Vui lòng đăng nhập để gửi báo cáo." },
        { status: 401 }
      );
    }

    const { targetType, targetId, reason } = await req.json();

    if (targetType !== "icon" && targetType !== "comment") {
      return NextResponse.json(
        { message: "Loại nội dung báo cáo không hợp lệ." },
        { status: 400 }
      );
    }

    if (!targetId) {
      return NextResponse.json(
        { message: "Thiếu nội dung cần báo cáo." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const target =
      targetType === "icon"
        ? await Icon.findById(targetId).select("_id")
        : await Comment.findById(targetId).select("_id");

    if (!target) {
      return NextResponse.json(
        { message: "Nội dung này không còn tồn tại." },
        { status: 404 }
      );
    }

    const reporter = await User.findById(userId).select("name");
    if (!reporter) {
      return NextResponse.json(
        { message: "Không tìm thấy tài khoản." },
        { status: 404 }
      );
    }

    const report = await Report.create({
      targetType,
      targetId,
      reporterId: userId,
      reporterName: reporter.name,
      reason: typeof reason === "string" ? reason.trim().slice(0, 300) : "",
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Lỗi API Gửi báo cáo:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
