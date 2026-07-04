import mongoose from "mongoose";

// 1. Định nghĩa khuôn mẫu (Schema) cho tài khoản người dùng
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập họ và tên"],
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true, // Đảm bảo không bị trùng lặp email trong hệ thống
      lowercase: true, // Tự động chuyển về chữ thường để tránh lỗi viết hoa viết thường
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
    },
  },
  {
    timestamps: true, // Tự động thêm trường ngày tạo (createdAt) và ngày cập nhật (updatedAt)
  }
);

// 2. Kiểm tra nếu Model "User" đã tồn tại trong bộ nhớ cache thì dùng lại, tránh lỗi compile lại của Next.js
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;