import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "../../../lib/auth";

// POST /api/logout -> xóa session cookie httpOnly ở phía server
export async function POST() {
  const response = NextResponse.json(
    { message: "Đã đăng xuất." },
    { status: 200 }
  );

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Hết hạn ngay lập tức
  });

  return response;
}
