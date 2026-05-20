import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // BUG FIX: confirmPassword DB mein store nahi karna chahiye - hata diya
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
