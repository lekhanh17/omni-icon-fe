import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

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

    // 5. Trả về phản hồi đăng nhập thành công kèm thông tin cơ bản của User
    return NextResponse.json(
      {
        message: "Đăng nhập thành công!",
        user: { id: user._id, name: user.name, email: user.email },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Lỗi API Đăng nhập:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}