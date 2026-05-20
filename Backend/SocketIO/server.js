import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // BUG FIX: Pehle yahan backend ka apna URL tha - galat tha
    // Yahan FRONTEND ka URL hona chahiye
    origin: process.env.FRONTEND_URL || "https://chat-sphere-fawn.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const users = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    users[userId] = socket.id;
  }

  // Sabko online users ki list bhejo
  io.emit("getOnlineUsers", Object.keys(users));

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (userId) {
      delete users[userId];
    }
    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { app, io, server };
