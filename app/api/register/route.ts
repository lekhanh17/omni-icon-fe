import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    // 1. Kết nối tới cơ sở dữ liệu MongoDB
    await connectToDatabase();

    // 2. Lấy dữ liệu từ phía Client (Frontend) gửi lên
    const { name, email, password } = await req.json();

    // 3. Kiểm tra xem Email này đã được đăng ký trước đó chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: "Email này đã được sử dụng bởi tài khoản khác." },
        { status: 400 },
      );
    }

    // 4. Tiến hành mã hóa mật khẩu (Salt round = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Tạo người dùng mới và lưu vào database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword, // Lưu mật khẩu đã mã hóa mã hóa
    });

    // 6. Trả về phản hồi thành công
    return NextResponse.json(
      { message: "Đăng ký tài khoản thành công!", userId: newUser._id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Lỗi API Đăng ký:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 },
    );
  }
}
