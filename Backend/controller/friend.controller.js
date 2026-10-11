import mongoose from "mongoose";
import User from "../models/user.model.js";
import FriendRequest from "../models/friendRequest.model.js";
import { emitToUser } from "../SocketIO/server.js";

const sameId = (a, b) => String(a) === String(b);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const notifyBoth = (a, b) => {
  emitToUser(a, "friendUpdate", {});
  emitToUser(b, "friendUpdate", {});
};

// GET /api/friend/people?search=  -> sab users, har ek ka relation ke saath
export const getPeople = async (req, res) => {
  try {
    const me = req.user._id;
    const search = (req.query.search || "").trim();

    const users = await User.find({
      _id: { $ne: me },
      fullname: { $regex: escapeRegex(search), $options: "i" },
    })
      .select("fullname email")
      .limit(50);

    const requests = await FriendRequest.find({ $or: [{ from: me }, { to: me }] });
    const requestMap = new Map();
    requests.forEach((r) => {
      const sent = sameId(r.from, me);
      const otherId = String(sent ? r.to : r.from);
      requestMap.set(otherId, { requestId: r._id, direction: sent ? "sent" : "received" });
    });

    const friendIds = new Set((req.user.friends || []).map(String));

    const result = users.map((u) => {
      const id = String(u._id);
      let relation = "none";
      let requestId = null;

      if (friendIds.has(id)) {
        relation = "friend";
      } else if (requestMap.has(id)) {
        const r = requestMap.get(id);
        relation = r.direction === "sent" ? "request_sent" : "request_received";
        requestId = r.requestId;
      }

      return { _id: u._id, fullname: u.fullname, email: u.email, relation, requestId };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.log("Error in getPeople:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/friend/list
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friends", "fullname email");
    return res.status(200).json(user?.friends || []);
  } catch (error) {
    console.log("Error in getFriends:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/friend/requests -> { incoming: [...], outgoing: [...] }
export const getRequests = async (req, res) => {
  try {
    const me = req.user._id;
    const requests = await FriendRequest.find({ $or: [{ from: me }, { to: me }] })
      .populate("from", "fullname email")
      .populate("to", "fullname email")
      .sort({ createdAt: -1 });

    const incoming = [];
    const outgoing = [];
    for (const r of requests) {
      if (sameId(r.to?._id, me) && r.from) {
        incoming.push({ _id: r._id, user: r.from });
      } else if (sameId(r.from?._id, me) && r.to) {
        outgoing.push({ _id: r._id, user: r.to });
      }
    }

    return res.status(200).json({ incoming, outgoing });
  } catch (error) {
    console.log("Error in getRequests:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/friend/request/:id
export const sendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const me = req.user._id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    if (sameId(id, me)) {
      return res.status(400).json({ error: "Khud ko friend request nahi bhej sakte" });
    }
    if ((req.user.friends || []).some((f) => sameId(f, id))) {
      return res.status(400).json({ error: "Ye user pehle se aapka friend hai" });
    }

    const target = await User.findById(id).select("_id");
    if (!target) {
      return res.status(404).json({ error: "User not found" });
    }

    const reverse = await FriendRequest.findOne({ from: id, to: me });
    if (reverse) {
      return res.status(400).json({ error: "Ye user aapko pehle hi request bhej chuka hai. Accept karo." });
    }

    const existing = await FriendRequest.findOne({ from: me, to: id });
    if (existing) {
      return res.status(400).json({ error: "Friend request pehle se bheji ja chuki hai" });
    }

    const fr = await FriendRequest.create({ from: me, to: id });
    notifyBoth(me, id);

    return res.status(201).json(fr);
  } catch (error) {
    console.log("Error in sendRequest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/friend/request/:requestId/accept
export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const me = req.user._id;

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const fr = await FriendRequest.findById(requestId);
    if (!fr || !sameId(fr.to, me)) {
      return res.status(404).json({ error: "Request not found" });
    }

    await Promise.all([
      User.updateOne({ _id: me }, { $addToSet: { friends: fr.from } }),
      User.updateOne({ _id: fr.from }, { $addToSet: { friends: me } }),
      FriendRequest.deleteOne({ _id: fr._id }),
    ]);

    notifyBoth(me, fr.from);
    return res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptRequest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/friend/request/:requestId  -> cancel (sender) ya reject (receiver)
export const removeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const me = req.user._id;

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const fr = await FriendRequest.findById(requestId);
    if (!fr || (!sameId(fr.from, me) && !sameId(fr.to, me))) {
      return res.status(404).json({ error: "Request not found" });
    }

    await fr.deleteOne();
    notifyBoth(fr.from, fr.to);

    return res.status(200).json({ message: "Request removed" });
  } catch (error) {
    console.log("Error in removeRequest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/friend/:id  -> unfriend
export const unfriend = async (req, res) => {
  try {
    const { id } = req.params;
    const me = req.user._id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    await Promise.all([
      User.updateOne({ _id: me }, { $pull: { friends: id } }),
      User.updateOne({ _id: id }, { $pull: { friends: me } }),
    ]);

    notifyBoth(me, id);
    return res.status(200).json({ message: "Friend removed" });
  } catch (error) {
    console.log("Error in unfriend:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
