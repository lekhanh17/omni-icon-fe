import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import Icon from "../../../../models/Icon";

// GET /api/icons/:id -> chi tiết 1 icon
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const icon = await Icon.findById(id);

    if (!icon) {
      return NextResponse.json(
        { message: "Không tìm thấy icon này." },
        { status: 404 }
      );
    }

    return NextResponse.json({ icon }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API Lấy chi tiết Icon:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra ở hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
