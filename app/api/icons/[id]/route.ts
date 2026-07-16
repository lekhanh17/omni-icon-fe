import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import Icon from "../../../../models/Icon";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth";

// GET /api/icons/:id -> chi tiết 1 icon
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const icon = await Icon.findById(id);

    if (!icon) {
      return NextResponse.json(
        { message: "Không tìm thấy icon này." },
        { status: 404 }
      );
    }

    return NextResponse.json({ icon }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Lấy chi tiết Icon:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

// PATCH /api/icons/:id -> chủ icon tự sửa tên/danh mục/thẻ/mã SVG của icon mình đã lưu
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;

    const icon = await Icon.findById(id);
    if (!icon) {
      return NextResponse.json(
        { message: "Không tìm thấy icon." },
        { status: 404 }
      );
    }

    if (!icon.authorId || icon.authorId.toString() !== userId) {
      return NextResponse.json(
        { message: "Bạn không có quyền sửa icon này." },
        { status: 403 }
      );
    }

    const { name, category, tags, svgCode } = await req.json();

    if (typeof name === "string") {
      const trimmed = name.trim();
      if (!trimmed) {
        return NextResponse.json(
          { message: "Tên icon không được để trống." },
          { status: 400 }
        );
      }
      icon.name = trimmed;
    }

    if (typeof category === "string" && category.trim()) {
      icon.category = category.trim();
    }

    if (Array.isArray(tags)) {
      icon.tags = tags
        .map((t: unknown) => String(t).trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 10);
    }

    if (typeof svgCode === "string") {
      const trimmedSvg = svgCode.trim();
      if (!trimmedSvg.startsWith("<svg")) {
        return NextResponse.json(
          { message: "Mã SVG không hợp lệ - phải bắt đầu bằng thẻ <svg>." },
          { status: 400 }
        );
      }
      icon.svgCode = trimmedSvg;
    }

    await icon.save();

    return NextResponse.json({ icon }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Sửa Icon:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
