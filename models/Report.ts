import mongoose from "mongoose";

// Báo cáo vi phạm do người dùng gửi lên cho icon hoặc bình luận, Staff/Admin xử lý trong /admin
const ReportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ["icon", "comment"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reporterName: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);

export default Report;
