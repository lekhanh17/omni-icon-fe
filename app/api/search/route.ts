import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db";
import Icon from "../../../models/Icon";
import User from "../../../models/User";

// GET /api/search?q=... -> gợi ý nhanh gồm cả icon và người dùng khớp từ khóa
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({ icons: [], users: [] }, { status: 200 });
    }

    await connectToDatabase();

    const [icons, users] = await Promise.all([
      Icon.find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { tags: { $regex: q, $options: "i" } },
        ],
      })
        .select("name svgCode")
        .sort({ createdAt: -1 })
        .limit(5),
      User.find({
        username: { $exists: true, $ne: null },
        $or: [
          { username: { $regex: q, $options: "i" } },
          { name: { $regex: q, $options: "i" } },
        ],
      })
        .select("name username avatarUrl")
        .limit(5),
    ]);

    return NextResponse.json({ icons, users }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Tìm kiếm nhanh:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
