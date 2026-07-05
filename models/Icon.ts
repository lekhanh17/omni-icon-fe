import mongoose from "mongoose";

// Định nghĩa khuôn mẫu (Schema) cho một Icon do người dùng tạo/lưu lại
const IconSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng đặt tên cho icon"],
      trim: true,
    },
    svgCode: {
      type: String,
      required: [true, "Thiếu mã SVG của icon"],
    },
    shape: {
      type: String,
      default: "star", // Tên hình dạng gốc dùng để tạo icon (mở rộng sau này)
    },
    color: {
      type: String,
      default: "#404E3B",
    },
    size: {
      type: Number,
      default: 120,
    },
    strokeWidth: {
      type: Number,
      default: 2,
    },
    category: {
      type: String,
      default: "general",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    authorName: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt / updatedAt
  }
);

// Tránh lỗi biên dịch lại Model nhiều lần khi Next.js hot-reload
const Icon = mongoose.models.Icon || mongoose.model("Icon", IconSchema);

export default Icon;
