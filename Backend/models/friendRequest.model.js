import mongoose from "mongoose";

// Pending friend request. Accept/reject ke baad document delete ho jata hai,
// friendship User.friends mein store hoti hai.
const friendRequestSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });
friendRequestSchema.index({ to: 1 });

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
export default FriendRequest;
