import mongoose from "mongoose";
import Todo from "../models/todo.model.js";

const PRIORITIES = ["low", "medium", "high"];

// GET /api/todo
export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user._id }).sort({ done: 1, dueDate: 1, createdAt: -1 });
    return res.status(200).json(todos);
  } catch (error) {
    console.log("Error in getTodos:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/todo
export const createTodo = async (req, res) => {
  try {
    const title = (req.body.title || "").trim();
    const priority = PRIORITIES.includes(req.body.priority) ? req.body.priority : "medium";
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;

    if (!title) return res.status(400).json({ error: "Task ka title likho" });
    if (dueDate && isNaN(dueDate)) return res.status(400).json({ error: "Due date galat hai" });

    const todo = await Todo.create({ userId: req.user._id, title, priority, dueDate });
    return res.status(201).json(todo);
  } catch (error) {
    console.log("Error in createTodo:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/todo/:id
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid todo id" });

    const update = {};
    if (typeof req.body.title === "string") {
      const title = req.body.title.trim();
      if (!title) return res.status(400).json({ error: "Title khaali nahi ho sakta" });
      update.title = title;
    }
    if (typeof req.body.done === "boolean") update.done = req.body.done;
    if (PRIORITIES.includes(req.body.priority)) update.priority = req.body.priority;
    if ("dueDate" in req.body) {
      update.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
      if (update.dueDate && isNaN(update.dueDate)) return res.status(400).json({ error: "Due date galat hai" });
    }

    const todo = await Todo.findOneAndUpdate({ _id: id, userId: req.user._id }, update, {
      new: true,
      runValidators: true,
    });
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    return res.status(200).json(todo);
  } catch (error) {
    console.log("Error in updateTodo:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/todo/:id
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid todo id" });

    const todo = await Todo.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    return res.status(200).json({ message: "Todo deleted" });
  } catch (error) {
    console.log("Error in deleteTodo:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/todo/completed
export const clearCompleted = async (req, res) => {
  try {
    const result = await Todo.deleteMany({ userId: req.user._id, done: true });
    return res.status(200).json({ deleted: result.deletedCount });
  } catch (error) {
    console.log("Error in clearCompleted:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
