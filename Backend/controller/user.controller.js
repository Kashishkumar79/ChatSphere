import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import createTokenAndSaveCookie from "../jwt/generateToken.js";

export const signup = async (req, res) => {
  const { fullname, email, password, confirmPassword } = req.body;
  try {
    if (!fullname || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already registered with this email" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullname,
      email,
      password: hashPassword,
    });

    await newUser.save();

    const token = createTokenAndSaveCookie(newUser._id, res);

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log("Error in signup:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = createTokenAndSaveCookie(user._id, res);

    return res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Error in login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("Error in logout:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const allUsers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const loggedInUser = req.user._id;

    const filteredUsers = await User.find({
      fullname: { $regex: search, $options: "i" },
      _id: { $ne: loggedInUser },
    }).select("-password");

    return res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in allUsers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};