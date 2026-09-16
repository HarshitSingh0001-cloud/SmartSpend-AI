import express from "express";
import { buildInsightsSummary } from "../utils/insightsSummary.js";

const router = express.Router();

// GET /api/insights?month=2026-08
// Returns everything the dashboard needs in one call: health score,
// biggest-category insight, budget alerts, and month-over-month comparison.
router.get("/", async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const summary = await buildInsightsSummary(month);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
