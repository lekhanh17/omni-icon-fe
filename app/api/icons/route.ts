import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db";
import Icon from "../../../models/Icon";

// GET /api/icons?q=tên&category=... -> danh sách icon (mới nhất trước)
export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("category")?.trim();
    const limit = Number(searchParams.get("limit")) || 100;

    const filter: Record<string, unknown> = {};

    if (q) {
      // Tìm theo tên hoặc tag, không phân biệt hoa thường
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    const icons = await Icon.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 200));

    return NextResponse.json({ icons }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Lấy danh sách Icon:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

// POST /api/icons -> lưu icon mới được tạo từ Builder
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const {
      name,
      svgCode,
      shape,
      color,
      size,
      strokeWidth,
      category,
      tags,
      authorId,
      authorName,
    } = await req.json();

    if (!name || !svgCode) {
      return NextResponse.json(
        { message: "Vui lòng nhập tên icon trước khi lưu." },
        { status: 400 }
      );
    }

    const newIcon = await Icon.create({
      name,
      svgCode,
      shape,
      color,
      size,
      strokeWidth,
      category,
      tags,
      authorId: authorId || undefined,
      authorName,
    });

    return NextResponse.json(
      { message: "Lưu icon thành công!", icon: newIcon },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi API Lưu Icon:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
