import express from "express";
import { downloadFile } from "../controller/file.controller.js";
import secureRoute from "../middleware/secureRoute.js";

const router = express.Router();
router.get("/:id", secureRoute, downloadFile);

export default router;
