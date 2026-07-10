import mongoose from "mongoose";

// Bình luận của người dùng dưới mỗi icon
const CommentSchema = new mongoose.Schema(
  {
    iconId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Icon",
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Lưu lại tên/avatar tại thời điểm bình luận
    authorName: {
      type: String,
      required: true,
    },
    authorAvatarUrl: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      required: [true, "Nội dung bình luận không được để trống"],
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);

export default Comment;
