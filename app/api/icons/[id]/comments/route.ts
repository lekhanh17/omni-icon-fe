import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import Comment from "../../../../../models/Comment";
import Icon from "../../../../../models/Icon";
import User from "../../../../../models/User";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../../lib/auth";

// GET /api/icons/:id/comments -> danh sách bình luận của 1 icon (cũ -> mới)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const comments = await Comment.find({ iconId: id }).sort({ createdAt: 1 });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Lấy bình luận:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

// POST /api/icons/:id/comments -> gửi bình luận mới (yêu cầu đăng nhập)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);

    if (!userId) {
      return NextResponse.json(
        { message: "Vui lòng đăng nhập để bình luận." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const text = (body.text || "").trim();

    if (!text) {
      return NextResponse.json(
        { message: "Nội dung bình luận không được để trống." },
        { status: 400 }
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { message: "Bình luận tối đa 500 ký tự." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const { id } = await params;

    const [icon, user] = await Promise.all([
      Icon.findById(id).select("_id"),
      User.findById(userId).select("name avatarUrl"),
    ]);

    if (!icon) {
      return NextResponse.json(
        { message: "Không tìm thấy icon." },
        { status: 404 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy tài khoản." },
        { status: 404 }
      );
    }

    const comment = await Comment.create({
      iconId: id,
      authorId: userId,
      authorName: user.name,
      authorAvatarUrl: user.avatarUrl || "",
      text,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Lỗi API Gửi bình luận:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
