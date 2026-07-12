import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import Collection from "../../../../models/Collection";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth";

// GET /api/me/collections -> danh sách bộ sưu tập của tài khoản đang đăng nhập
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
    }

    await connectToDatabase();
    const collections = await Collection.find({ ownerId: userId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ collections }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Lấy danh sách bộ sưu tập:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

// POST /api/me/collections -> tạo bộ sưu tập mới
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
    }

    const { name, iconId } = await req.json();
    const trimmedName = typeof name === "string" ? name.trim() : "";

    if (!trimmedName) {
      return NextResponse.json(
        { message: "Vui lòng đặt tên cho bộ sưu tập." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const collection = await Collection.create({
      name: trimmedName,
      ownerId: userId,
      iconIds: iconId ? [iconId] : [],
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error("Lỗi API Tạo bộ sưu tập:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
