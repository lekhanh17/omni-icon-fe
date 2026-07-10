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

// Kiểm tra người gọi API có phải admin đã đăng nhập không - dùng chung cho mọi route /api/admin/*
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
