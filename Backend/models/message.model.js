import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // DM ke liye receiverId, group message ke liye groupId
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      required: function () {
        return !this.groupId;
      },
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
      index: true,
    },
    // Text ya file, dono mein se kuch ek zaroori hai (controller check karta hai)
    message: {
      type: String,
      trim: true,
      default: "",
    },
    // Document / file attachment (optional)
    attachment: {
      originalName: String,
      mimetype: String,
      size: Number,
      storedName: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("message", messageSchema);
export default Message;
