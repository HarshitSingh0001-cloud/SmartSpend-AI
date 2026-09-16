import express from "express";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// GET /api/transactions?month=2026-08
router.get("/", async (req, res) => {
  try {
    const { month } = req.query; // "YYYY-MM"
    let filter = {};
    if (month) {
      const [year, mon] = month.split("-").map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 1);
      filter.date = { $gte: start, $lt: end };
    }
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions
router.post("/", async (req, res) => {
  try {
    const { type, amount, category, note, date } = req.body;
    if (!type || !amount || !category) {
      return res.status(400).json({ error: "type, amount, and category are required" });
    }
    const transaction = await Transaction.create({ type, amount, category, note, date });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/transactions/:id
router.put("/:id", async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Transaction not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Transaction not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
