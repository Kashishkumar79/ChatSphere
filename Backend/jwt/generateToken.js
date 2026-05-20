import jwt from "jsonwebtoken";

const createTokenAndSaveCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_TOKEN, {
    expiresIn: "10d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    // BUG FIX: "none" zaroori hai cross-origin (Vercel + Render) ke liye
    // "lax" cross-site cookies block kar deta tha
    sameSite: "none",
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
  });

  return token;
};

export default createTokenAndSaveCookie;
