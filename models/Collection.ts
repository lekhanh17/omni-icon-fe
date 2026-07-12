import mongoose from "mongoose";

// Bộ sưu tập icon cá nhân của người dùng (khác Yêu thích - do người dùng tự đặt tên, tự gom nhóm)
const CollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng đặt tên cho bộ sưu tập"],
      trim: true,
      maxlength: 60,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    iconIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Icon",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Collection =
  mongoose.models.Collection || mongoose.model("Collection", CollectionSchema);

export default Collection;
