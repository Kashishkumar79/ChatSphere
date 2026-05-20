import jwt from "jsonwebtoken";

const createTokenAndSaveCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_TOKEN, {
    expiresIn: "10d",
  });

  res.cookie("jwt", token, {
  httpOnly: true,
  secure: true,       // ✅ HTTPS pe zaroori
  sameSite: "none",   // ✅ Cross-origin ke liye zaroori
  maxAge: 10 * 24 * 60 * 60 * 1000,
});

  return token;
};

export default createTokenAndSaveCookie;
