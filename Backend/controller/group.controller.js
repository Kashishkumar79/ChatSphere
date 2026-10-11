import mongoose from "mongoose";
import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import { emitToUser } from "../SocketIO/server.js";
import { discardFile, toAttachment } from "../middleware/upload.js";

// Populated doc ho ya plain ObjectId, dono se string id nikalo
const idOf = (x) => String(x?._id ?? x);
const sameId = (a, b) => idOf(a) === idOf(b);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isMember = (group, userId) => group.members.some((m) => sameId(m, userId));
const isAdmin = (group, userId) => sameId(group.admin, userId);

// Group ko list ke liye serialize karo
const serializeGroup = (group, userId) => ({
  _id: group._id,
  name: group.name,
  description: group.description || "",
  adminId: idOf(group.admin),
  adminName: group.admin?.fullname || null,
  memberCount: group.members.length,
  isAdmin: isAdmin(group, userId),
  isMember: isMember(group, userId),
  hasRequested: group.joinRequests.some((r) => sameId(r.user, userId)),
  pendingCount: isAdmin(group, userId) ? group.joinRequests.length : 0,
  createdAt: group.createdAt,
  updatedAt: group.updatedAt,
});

// Client ko attachment ka sirf safe data bhejo (server ka stored naam nahi)
const publicAttachment = (att) =>
  att?.storedName ? { originalName: att.originalName, mimetype: att.mimetype, size: att.size } : null;

const notifyMembers = (group, event, data, exceptId) => {
  group.members.forEach((m) => {
    if (!exceptId || !sameId(m, exceptId)) emitToUser(m, event, data);
  });
};

// POST /api/group  -> group banane wala admin hoga
export const createGroup = async (req, res) => {
  try {
    const me = req.user._id;
    const name = (req.body.name || "").trim();
    const description = (req.body.description || "").trim();

    if (!name) return res.status(400).json({ error: "Group ka naam zaruri hai" });
    if (name.length > 60) return res.status(400).json({ error: "Group ka naam 60 characters se chhota rakho" });

    const group = await Group.create({ name, description, admin: me, members: [me] });
    await group.populate("admin", "fullname");

    return res.status(201).json(serializeGroup(group, me));
  } catch (error) {
    console.log("Error in createGroup:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/group/mine  -> jin groups ka main member hoon
export const getMyGroups = async (req, res) => {
  try {
    const me = req.user._id;
    const groups = await Group.find({ members: me })
      .populate("admin", "fullname")
      .sort({ updatedAt: -1 });
    return res.status(200).json(groups.map((g) => serializeGroup(g, me)));
  } catch (error) {
    console.log("Error in getMyGroups:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/group/discover?search=  -> woh groups jinme main member nahi hoon
export const discoverGroups = async (req, res) => {
  try {
    const me = req.user._id;
    const search = (req.query.search || "").trim();
    const groups = await Group.find({
      members: { $ne: me },
      name: { $regex: escapeRegex(search), $options: "i" },
    })
      .populate("admin", "fullname")
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json(groups.map((g) => serializeGroup(g, me)));
  } catch (error) {
    console.log("Error in discoverGroups:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/group/:id  -> details (members + join requests sirf admin ko)
export const getGroup = async (req, res) => {
  try {
    const me = req.user._id;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid group id" });

    const group = await Group.findById(id)
      .populate("admin", "fullname email")
      .populate("members", "fullname email")
      .populate("joinRequests.user", "fullname email");

    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!isMember(group, me)) return res.status(403).json({ error: "Aap is group ke member nahi ho" });

    const admin = isAdmin(group, me);
    return res.status(200).json({
      ...serializeGroup(group, me),
      members: group.members,
      joinRequests: admin
        ? group.joinRequests
            .filter((r) => r.user)
            .map((r) => ({ user: r.user, createdAt: r.createdAt }))
        : [],
    });
  } catch (error) {
    console.log("Error in getGroup:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/group/:id/join  -> join request bhejo
export const requestJoin = async (req, res) => {
  try {
    const me = req.user._id;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid group id" });

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (isMember(group, me)) return res.status(400).json({ error: "Aap pehle se member ho" });
    if (group.joinRequests.some((r) => sameId(r.user, me))) {
      return res.status(400).json({ error: "Join request pehle se bheji ja chuki hai" });
    }

    group.joinRequests.push({ user: me });
    await group.save();

    emitToUser(group.admin, "groupUpdate", { groupId: String(group._id) });
    return res.status(201).json({ message: "Join request admin ko bhej di gayi" });
  } catch (error) {
    console.log("Error in requestJoin:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/group/:id/join  -> apni pending request cancel karo
export const cancelJoin = async (req, res) => {
  try {
    const me = req.user._id;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid group id" });

    const group = await Group.findByIdAndUpdate(id, { $pull: { joinRequests: { user: me } } });
    if (!group) return res.status(404).json({ error: "Group not found" });

    emitToUser(group.admin, "groupUpdate", { groupId: String(group._id) });
    return res.status(200).json({ message: "Request cancelled" });
  } catch (error) {
    console.log("Error in cancelJoin:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/group/:id/requests/:userId/approve  (sirf admin)
export const approveRequest = async (req, res) => {
  try {
    const me = req.user._id;
    const { id, userId } = req.params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!isAdmin(group, me)) return res.status(403).json({ error: "Sirf admin requests approve kar sakta hai" });
    if (!group.joinRequests.some((r) => sameId(r.user, userId))) {
      return res.status(404).json({ error: "Request not found" });
    }

    await Group.updateOne(
      { _id: id },
      { $pull: { joinRequests: { user: userId } }, $addToSet: { members: userId } }
    );

    emitToUser(userId, "groupUpdate", { groupId: String(id) });
    emitToUser(me, "groupUpdate", { groupId: String(id) });
    return res.status(200).json({ message: "Member added to group" });
  } catch (error) {
    console.log("Error in approveRequest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/group/:id/requests/:userId/reject  (sirf admin)
export const rejectRequest = async (req, res) => {
  try {
    const me = req.user._id;
    const { id, userId } = req.params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!isAdmin(group, me)) return res.status(403).json({ error: "Sirf admin requests reject kar sakta hai" });

    await Group.updateOne({ _id: id }, { $pull: { joinRequests: { user: userId } } });

    emitToUser(userId, "groupUpdate", { groupId: String(id) });
    emitToUser(me, "groupUpdate", { groupId: String(id) });
    return res.status(200).json({ message: "Request rejected" });
  } catch (error) {
    console.log("Error in rejectRequest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/group/:id/members/:userId  (sirf admin, admin khud ko remove nahi kar sakta)
export const removeMember = async (req, res) => {
  try {
    const me = req.user._id;
    const { id, userId } = req.params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!isAdmin(group, me)) return res.status(403).json({ error: "Sirf admin member remove kar sakta hai" });
    if (sameId(userId, me)) return res.status(400).json({ error: "Admin khud ko remove nahi kar sakta" });

    await Group.updateOne({ _id: id }, { $pull: { members: userId } });

    emitToUser(userId, "groupUpdate", { groupId: String(id), removed: true });
    return res.status(200).json({ message: "Member removed" });
  } catch (error) {
    console.log("Error in removeMember:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/group/:id/members/:userId  (sirf admin, sirf apne friend ko add kar sakta hai)
export const addMember = async (req, res) => {
  try {
    const me = req.user._id;
    const { id, userId } = req.params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!isAdmin(group, me)) return res.status(403).json({ error: "Sirf admin member add kar sakta hai" });
    if (isMember(group, userId)) return res.status(400).json({ error: "Ye user pehle se member hai" });

    const isFriend = (req.user.friends || []).some((f) => sameId(f, userId));
    if (!isFriend) {
      return res.status(403).json({ error: "Sirf apne friends ko group mein add kar sakte ho" });
    }

    await Group.updateOne(
      { _id: id },
      { $addToSet: { members: userId }, $pull: { joinRequests: { user: userId } } }
    );

    emitToUser(userId, "groupUpdate", { groupId: String(id) });
    return res.status(200).json({ message: "Member added" });
  } catch (error) {
    console.log("Error in addMember:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/group/:id/leave  (admin leave nahi kar sakta)
export const leaveGroup = async (req, res) => {
  try {
    const me = req.user._id;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid group id" });

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!isMember(group, me)) return res.status(400).json({ error: "Aap is group ke member nahi ho" });
    if (isAdmin(group, me)) {
      return res.status(400).json({ error: "Admin group chhod nahi sakta. Group delete kar sakte ho." });
    }

    await Group.updateOne({ _id: id }, { $pull: { members: me } });
    return res.status(200).json({ message: "Group left" });
  } catch (error) {
    console.log("Error in leaveGroup:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/group/:id  (sirf admin)
export const deleteGroup = async (req, res) => {
  try {
    const me = req.user._id;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid group id" });

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!isAdmin(group, me)) return res.status(403).json({ error: "Sirf admin group delete kar sakta hai" });

    notifyMembers(group, "groupUpdate", { groupId: String(id), deleted: true });
    await Message.deleteMany({ groupId: id });
    await group.deleteOne();

    return res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    console.log("Error in deleteGroup:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/group/:id/messages  (sirf members)
export const getGroupMessages = async (req, res) => {
  try {
    const me = req.user._id;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid group id" });

    const group = await Group.findById(id).select("members");
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!isMember(group, me)) return res.status(403).json({ error: "Aap is group ke member nahi ho" });

    const messages = await Message.find({ groupId: id })
      .populate("senderId", "fullname")
      .sort({ createdAt: -1 })
      .limit(200);

    return res.status(200).json(
      messages.reverse().map((m) => ({
        _id: m._id,
        groupId: m.groupId,
        senderId: String(m.senderId?._id ?? m.senderId),
        senderName: m.senderId?.fullname || "Unknown",
        message: m.message,
        attachment: publicAttachment(m.attachment),
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      }))
    );
  } catch (error) {
    console.log("Error in getGroupMessages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/group/:id/messages  (sirf members, text ya file)
export const sendGroupMessage = async (req, res) => {
  try {
    const me = req.user._id;
    const { id } = req.params;
    const text = (req.body.message || "").trim();
    const file = req.file;
    if (!mongoose.isValidObjectId(id)) {
      discardFile(file);
      return res.status(400).json({ error: "Invalid group id" });
    }
    if (!text && !file) return res.status(400).json({ error: "Message ya file mein se kuch bhejo" });

    const group = await Group.findById(id).select("members");
    if (!group) {
      discardFile(file);
      return res.status(404).json({ error: "Group not found" });
    }
    if (!isMember(group, me)) {
      discardFile(file);
      return res.status(403).json({ error: "Aap is group ke member nahi ho" });
    }

    const attachment = toAttachment(file);
    const msg = await Message.create({ senderId: me, groupId: id, message: text, attachment });
    await Group.updateOne({ _id: id }, { $currentDate: { updatedAt: true } });

    const payload = {
      _id: msg._id,
      groupId: msg.groupId,
      senderId: String(me),
      senderName: req.user.fullname,
      message: msg.message,
      attachment: publicAttachment(attachment),
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    };

    // Baaki members ko realtime bhejo
    notifyMembers(group, "newGroupMessage", { groupId: String(id), message: payload }, me);

    return res.status(201).json(payload);
  } catch (error) {
    console.log("Error in sendGroupMessage:", error);
    discardFile(req.file);
    return res.status(500).json({ error: "Internal server error" });
  }
};
