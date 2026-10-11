import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Allowed frontend origins (production + local dev)
export const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://chat-sphere-fawn.vercel.app",
  "http://localhost:5173",
  "http://localhost:3001",
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "DELETE", "PATCH"],
    credentials: true,
  },
});

const users = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => users[String(receiverId)];

// Kisi ek user ko event bhejo (agar woh online hai)
export const emitToUser = (userId, event, data) => {
  const socketId = users[String(userId)];
  if (socketId) io.to(socketId).emit(event, data);
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    users[userId] = socket.id;
  }

  // Sabko online users ki list bhejo
  io.emit("getOnlineUsers", Object.keys(users));

  socket.on("disconnect", () => {
    // Sirf tabhi delete karo jab yehi socket active ho
    if (userId && users[userId] === socket.id) {
      delete users[userId];
    }
    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { app, io, server };
