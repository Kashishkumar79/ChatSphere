import express from "express";
import {
  clearCompleted,
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from "../controller/todo.controller.js";
import secureRoute from "../middleware/secureRoute.js";

const router = express.Router();

router.get("/", secureRoute, getTodos);
router.post("/", secureRoute, createTodo);
router.delete("/completed", secureRoute, clearCompleted);
router.patch("/:id", secureRoute, updateTodo);
router.delete("/:id", secureRoute, deleteTodo);

export default router;
