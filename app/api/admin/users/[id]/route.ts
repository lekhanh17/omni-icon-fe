import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import User from "../../../../../models/User";
import { requireAdmin } from "../../../../../lib/requireAdmin";

// PATCH /api/admin/users/:id -> đổi vai trò (user/admin) và/hoặc khoá/mở khoá tài khoản
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await requireAdmin(req);
    if (!check.ok) {
      return NextResponse.json({ message: check.message }, { status: check.status });
    }

    const { id } = await params;

    // Không cho tự đổi quyền/khoá chính mình để tránh tự khoá tay mất quyền truy cập
    if (id === check.userId) {
      return NextResponse.json(
        { message: "Không thể tự thay đổi quyền/trạng thái của chính mình." },
        { status: 400 }
      );
    }

    const { role, isBanned } = await req.json();

    const update: { role?: string; isBanned?: boolean } = {};
    if (role === "admin" || role === "user") {
      update.role = role;
    }
    if (typeof isBanned === "boolean") {
      update.isBanned = isBanned;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { message: "Không có gì để cập nhật." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findByIdAndUpdate(id, update, { new: true }).select(
      "name email username role isBanned"
    );

    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy người dùng." },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Cập nhật người dùng (admin):", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
