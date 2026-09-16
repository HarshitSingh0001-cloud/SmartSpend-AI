import express from "express";
import Budget from "../models/Budget.js";

const router = express.Router();

// GET /api/budgets?month=2026-08
router.get("/", async (req, res) => {
  try {
    const { month } = req.query;
    const filter = month ? { month } : {};
    const budgets = await Budget.find(filter);
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/budgets  { category, monthlyLimit, month }
// Upserts so setting a budget for a category/month twice just updates it.
router.post("/", async (req, res) => {
  try {
    const { category, monthlyLimit, month } = req.body;
    if (!category || monthlyLimit == null || !month) {
      return res.status(400).json({ error: "category, monthlyLimit, and month are required" });
    }
    const budget = await Budget.findOneAndUpdate(
      { category, month },
      { monthlyLimit },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/budgets/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Budget.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Budget not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
