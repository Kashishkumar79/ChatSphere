import express from "express";
import {
  addMember,
  approveRequest,
  cancelJoin,
  createGroup,
  deleteGroup,
  discoverGroups,
  getGroup,
  getGroupMessages,
  getMyGroups,
  leaveGroup,
  rejectRequest,
  removeMember,
  requestJoin,
  sendGroupMessage,
} from "../controller/group.controller.js";
import secureRoute from "../middleware/secureRoute.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

router.post("/", secureRoute, createGroup);
router.get("/mine", secureRoute, getMyGroups);
router.get("/discover", secureRoute, discoverGroups);

router.get("/:id", secureRoute, getGroup);
router.delete("/:id", secureRoute, deleteGroup);

router.post("/:id/join", secureRoute, requestJoin);
router.delete("/:id/join", secureRoute, cancelJoin);
router.post("/:id/requests/:userId/approve", secureRoute, approveRequest);
router.post("/:id/requests/:userId/reject", secureRoute, rejectRequest);
router.post("/:id/members/:userId", secureRoute, addMember);
router.delete("/:id/members/:userId", secureRoute, removeMember);
router.post("/:id/leave", secureRoute, leaveGroup);

router.get("/:id/messages", secureRoute, getGroupMessages);
router.post("/:id/messages", secureRoute, uploadSingle("file"), sendGroupMessage);

export default router;
