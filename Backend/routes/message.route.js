import express from "express";
import { getMessage, sendMessage } from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRoute.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();
router.post("/send/:id", secureRoute, uploadSingle("file"), sendMessage);
router.get("/get/:id", secureRoute, getMessage);

export default router;
