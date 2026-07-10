import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import Icon from "../../../../models/Icon";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth";

// GET /api/me/favorites -> danh sách icon mà tài khoản đang đăng nhập đã yêu thích
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
    }

    await connectToDatabase();
    const icons = await Icon.find({ likedBy: userId }).sort({ createdAt: -1 });

    return NextResponse.json({ icons }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Lấy Icon yêu thích:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
