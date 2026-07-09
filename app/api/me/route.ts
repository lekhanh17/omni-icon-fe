import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../lib/auth";
import { generateUniqueUsername } from "../../../lib/username";

// Đọc userId từ session cookie httpOnly - không bao giờ tin userId do client tự gửi lên
function getUserIdFromRequest(req: NextRequest): string | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

// GET /api/me -> thông tin tài khoản đang đăng nhập
export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy tài khoản." },
        { status: 404 }
      );
    }

    // Tự sinh username cho tài khoản cũ chưa có (từ phần đầu email), chỉ chạy 1 lần
    if (!user.username) {
      user.username = await generateUniqueUsername(user.email.split("@")[0]);
      await user.save();
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Lấy thông tin cá nhân:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

// PATCH /api/me -> cập nhật tên và/hoặc đổi mật khẩu của chính tài khoản đang đăng nhập
export async function PATCH(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy tài khoản." },
        { status: 404 }
      );
    }

    const { name, currentPassword, newPassword, username, bio, avatarUrl } =
      await req.json();

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    if (typeof username === "string" && username.trim()) {
      const candidate = username.trim().toLowerCase();

      if (!/^[a-z0-9_]{3,20}$/.test(candidate)) {
        return NextResponse.json(
          {
            message:
              "Tên người dùng chỉ gồm chữ thường, số, dấu gạch dưới, 3-20 ký tự.",
          },
          { status: 400 }
        );
      }

      const taken = await User.findOne({
        username: candidate,
        _id: { $ne: user._id },
      });
      if (taken) {
        return NextResponse.json(
          { message: "Tên người dùng này đã có người khác dùng." },
          { status: 400 }
        );
      }

      user.username = candidate;
    }

    if (typeof bio === "string") {
      user.bio = bio.trim().slice(0, 200);
    }

    if (typeof avatarUrl === "string" && avatarUrl) {
      if (!avatarUrl.startsWith("data:image/")) {
        return NextResponse.json(
          { message: "Ảnh đại diện không hợp lệ." },
          { status: 400 }
        );
      }
      if (avatarUrl.length > 2_000_000) {
        return NextResponse.json(
          { message: "Ảnh đại diện quá lớn, hãy chọn ảnh nhỏ hơn." },
          { status: 400 }
        );
      }
      user.avatarUrl = avatarUrl;
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu." },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { message: "Mật khẩu hiện tại không đúng." },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { message: "Mật khẩu mới phải có ít nhất 8 ký tự." },
          { status: 400 }
        );
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return NextResponse.json(
      {
        message: "Cập nhật thông tin thành công!",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lỗi API Cập nhật thông tin cá nhân:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
