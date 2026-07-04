import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Vui lòng định nghĩa biến MONGODB_URI trong file .env.local");
}

// Định nghĩa kiểu dữ liệu cho biến global lưu kết nối mã nguồn
interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

// Kiểm tra và khởi tạo nếu chưa có global.mongoose
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

// Thêm dấu ! ở cuối để ép kiểu, báo cho TypeScript biết chắc chắn biến này không bị undefined
const cached = global.mongoose!;

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongooseInstance) => {
        console.log("🚀 Kết nối MongoDB thành công!");
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
