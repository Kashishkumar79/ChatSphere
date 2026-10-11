import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import friendRoute from "./routes/friend.route.js";
import groupRoute from "./routes/group.route.js";
import todoRoute from "./routes/todo.route.js";
import fileRoute from "./routes/file.route.js";
import { app, server, allowedOrigins } from "./SocketIO/server.js";

dotenv.config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);
app.use("/api/friend", friendRoute);
app.use("/api/group", groupRoute);
app.use("/api/todo", todoRoute);
app.use("/api/file", fileRoute);

app.get("/", (req, res) => {
  res.json({ status: "Backend Running Successfully ✅" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3001;
const URI = process.env.MONGODB_URI;

mongoose
  .connect(URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
