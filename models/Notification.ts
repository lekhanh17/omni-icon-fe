import mongoose from "mongoose";

// Thông báo gửi tới 1 người dùng cụ thể (bình luận mới, được thích, báo cáo đã xử lý...)
const NotificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["comment", "like", "report_resolved", "follow"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: "", // Đường dẫn điều hướng khi bấm vào thông báo (nếu có)
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Tối ưu truy vấn "lấy thông báo mới nhất của 1 người dùng"
NotificationSchema.index({ recipientId: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

export default Notification;
