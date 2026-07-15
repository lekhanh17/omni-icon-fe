import mongoose from "mongoose";

// Quan hệ theo dõi giữa 2 người dùng: followerId đang theo dõi followingId
const FollowSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Mỗi cặp (follower, following) chỉ tồn tại 1 lần
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
// Tối ưu truy vấn "danh sách người mình đang theo dõi"
FollowSchema.index({ followerId: 1, createdAt: -1 });

const Follow = mongoose.models.Follow || mongoose.model("Follow", FollowSchema);

export default Follow;
