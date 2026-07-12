import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import Collection from "../../../../../models/Collection";
import Icon from "../../../../../models/Icon";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../../lib/auth";

// GET /api/me/collections/:id -> chi tiết 1 bộ sưu tập (kèm danh sách icon bên trong)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const collection = await Collection.findById(id);
    if (!collection) {
      return NextResponse.json(
        { message: "Không tìm thấy bộ sưu tập." },
        { status: 404 }
      );
    }

    if (collection.ownerId.toString() !== userId) {
      return NextResponse.json(
        { message: "Bạn không có quyền xem bộ sưu tập này." },
        { status: 403 }
      );
    }

    const icons = await Icon.find({ _id: { $in: collection.iconIds } });

    return NextResponse.json({ collection, icons }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Lấy chi tiết bộ sưu tập:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

// PATCH /api/me/collections/:id -> đổi tên và/hoặc thêm/bớt icon trong bộ sưu tập
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const collection = await Collection.findById(id);
    if (!collection) {
      return NextResponse.json(
        { message: "Không tìm thấy bộ sưu tập." },
        { status: 404 }
      );
    }

    if (collection.ownerId.toString() !== userId) {
      return NextResponse.json(
        { message: "Bạn không có quyền chỉnh sửa bộ sưu tập này." },
        { status: 403 }
      );
    }

    const { name, addIconId, removeIconId } = await req.json();

    if (typeof name === "string" && name.trim()) {
      collection.name = name.trim().slice(0, 60);
    }

    if (addIconId) {
      const exists = collection.iconIds.some(
        (i: { toString: () => string }) => i.toString() === addIconId
      );
      if (!exists) {
        collection.iconIds.push(addIconId);
      }
    }

    if (removeIconId) {
      collection.iconIds = collection.iconIds.filter(
        (i: { toString: () => string }) => i.toString() !== removeIconId
      );
    }

    await collection.save();

    return NextResponse.json({ collection }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Cập nhật bộ sưu tập:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

// DELETE /api/me/collections/:id -> xoá bộ sưu tập
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const collection = await Collection.findById(id);
    if (!collection) {
      return NextResponse.json(
        { message: "Không tìm thấy bộ sưu tập." },
        { status: 404 }
      );
    }

    if (collection.ownerId.toString() !== userId) {
      return NextResponse.json(
        { message: "Bạn không có quyền xoá bộ sưu tập này." },
        { status: 403 }
      );
    }

    await collection.deleteOne();

    return NextResponse.json({ message: "Đã xoá bộ sưu tập." }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Xoá bộ sưu tập:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
