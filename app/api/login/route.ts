import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Kết nối tới cơ sở dữ liệu MongoDB
    await connectToDatabase();

    // 2. Lấy thông tin email và mật khẩu do người dùng nhập từ Frontend
    const { email, password } = await req.json();

    // 3. Tìm kiếm người dùng theo Email trong Database
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không chính xác." },
        { status: 400 }
      );
    }

    // 4. So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong DB bằng bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không chính xác." },
        { status: 400 }
      );
    }

    // 4.5. Tài khoản bị khoá thì không cho đăng nhập
    if (user.isBanned) {
      return NextResponse.json(
        { message: "Tài khoản của bạn đã bị khoá." },
        { status: 403 }
      );
    }

    // 4.6. Tự động phong admin cho email được cấu hình sẵn (chỉ chạy 1 lần khi chưa phải admin)
    if (
      process.env.ADMIN_BOOTSTRAP_EMAIL &&
      user.email === process.env.ADMIN_BOOTSTRAP_EMAIL.toLowerCase() &&
      user.role !== "admin"
    ) {
      user.role = "admin";
      await user.save();
    }

    // 5. Trả về phản hồi đăng nhập thành công kèm thông tin cơ bản của User
    const response = NextResponse.json(
      {
        message: "Đăng nhập thành công!",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // 6. Gắn session an toàn (httpOnly) để server tự xác định đúng người dùng
    // ở các API sau này, thay vì tin vào dữ liệu client tự gửi lên
    const token = createSessionToken(user._id.toString());
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Lỗi API Đăng nhập:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}