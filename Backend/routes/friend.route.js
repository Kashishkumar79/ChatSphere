import express from "express";
import {
  acceptRequest,
  getFriends,
  getPeople,
  getRequests,
  removeRequest,
  sendRequest,
  unfriend,
} from "../controller/friend.controller.js";
import secureRoute from "../middleware/secureRoute.js";

const router = express.Router();

router.get("/people", secureRoute, getPeople);
router.get("/list", secureRoute, getFriends);
router.get("/requests", secureRoute, getRequests);
router.post("/request/:id", secureRoute, sendRequest);
router.post("/request/:requestId/accept", secureRoute, acceptRequest);
router.delete("/request/:requestId", secureRoute, removeRequest);
router.delete("/:id", secureRoute, unfriend);

export default router;
