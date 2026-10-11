import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    // Group banane wala user hi admin hota hai
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Join requests jinhe admin approve/reject karega
    joinRequests: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

groupSchema.index({ members: 1 });

const Group = mongoose.model("Group", groupSchema);
export default Group;
