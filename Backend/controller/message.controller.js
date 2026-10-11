import mongoose from "mongoose";
import { emitToUser } from "../SocketIO/server.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { discardFile, toAttachment } from "../middleware/upload.js";

const isFriend = (user, otherId) =>
  (user.friends || []).some((f) => String(f) === String(otherId));

export const sendMessage = async (req, res) => {
  try {
    const text = (req.body.message || "").trim();
    const file = req.file;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!mongoose.isValidObjectId(receiverId)) {
      discardFile(file);
      return res.status(400).json({ error: "Invalid user id" });
    }
    if (!text && !file) {
      return res.status(400).json({ error: "Message ya file mein se kuch bhejo" });
    }
    // Sirf friends ko hi message kar sakte ho
    if (!isFriend(req.user, receiverId)) {
      discardFile(file);
      return res
        .status(403)
        .json({ error: "Sirf friends ko message kar sakte ho. Pehle friend request bhejo." });
    }

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message: text,
      attachment: toAttachment(file),
    });

    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    emitToUser(receiverId, "newMessage", newMessage);

    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage:", error);
    discardFile(req.file);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id: chatUser } = req.params;
    const senderId = req.user._id;

    if (!isFriend(req.user, chatUser)) {
      return res.status(403).json({ error: "Ye chat sirf friends ke saath available hai" });
    }

    const conversation = await Conversation.findOne({
      members: { $all: [senderId, chatUser] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json([]);
    }

    return res.status(200).json(conversation.messages);
  } catch (error) {
    console.log("Error in getMessage:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
