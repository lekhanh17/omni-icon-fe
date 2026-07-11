import { NextRequest } from "next/server";
import { connectToDatabase } from "./db";
import User from "../models/User";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./auth";

export interface AdminCheckResult {
  ok: boolean;
  status: number;
  message?: string;
  userId?: string;
}

// Kiểm tra người gọi API có phải admin đã đăng nhập không - dùng cho các route quản lý
// người dùng (đổi vai trò, khoá/mở khoá tài khoản) - CHỈ admin mới được, staff không được
export async function requireAdmin(req: NextRequest): Promise<AdminCheckResult> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const userId = verifySessionToken(token);

  if (!userId) {
    return { ok: false, status: 401, message: "Vui lòng đăng nhập." };
  }

  await connectToDatabase();
  const user = await User.findById(userId).select("role");

  if (!user || user.role !== "admin") {
    return {
      ok: false,
      status: 403,
      message: "Bạn không có quyền truy cập chức năng này.",
    };
  }

  return { ok: true, status: 200, userId };
}

// Kiểm tra người gọi API có phải admin HOẶC staff không - dùng cho các route kiểm duyệt
// nội dung (xoá icon/bình luận vi phạm), staff được phép làm việc này
export async function requireStaffOrAdmin(req: NextRequest): Promise<AdminCheckResult> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const userId = verifySessionToken(token);

  if (!userId) {
    return { ok: false, status: 401, message: "Vui lòng đăng nhập." };
  }

  await connectToDatabase();
  const user = await User.findById(userId).select("role");

  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return {
      ok: false,
      status: 403,
      message: "Bạn không có quyền truy cập chức năng này.",
    };
  }

  return { ok: true, status: 200, userId };
}
