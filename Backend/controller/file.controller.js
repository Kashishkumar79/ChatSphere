import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import { UPLOAD_DIR } from "../middleware/upload.js";

// GET /api/file/:id  -> sirf us user ko jo is chat ka hissa hai
export const downloadFile = async (req, res) => {
  try {
    const me = String(req.user._id);
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });

    const msg = await Message.findById(id);
    if (!msg || !msg.attachment?.storedName) return res.status(404).json({ error: "File not found" });

    let allowed = false;
    if (msg.groupId) {
      const group = await Group.findById(msg.groupId).select("members");
      allowed = !!group && group.members.some((m) => String(m) === me);
    } else {
      allowed = String(msg.senderId) === me || String(msg.receiverId) === me;
    }
    if (!allowed) return res.status(403).json({ error: "Is file ko access karne ki permission nahi hai" });

    const filePath = path.join(UPLOAD_DIR, path.basename(msg.attachment.storedName));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File server par nahi mili" });
    }
    return res.download(filePath, msg.attachment.originalName);
  } catch (error) {
    console.log("Error in downloadFile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
