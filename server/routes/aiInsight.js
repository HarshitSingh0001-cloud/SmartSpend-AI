import express from "express";
import { buildInsightsSummary } from "../utils/insightsSummary.js";

const router = express.Router();

/**
 * Builds a prompt from AGGREGATED numbers only — no transaction notes,
 * no dates, no individual line items. Keeps the request small, fast,
 * and doesn't leak granular spending history to a third-party API.
 */
function buildPrompt(summary) {
  const { totals, healthScore, biggestCategory, monthComparison, budgetAlerts } = summary;

  const lines = [
    `Monthly income: ₹${totals.income}`,
    `Monthly expenses: ₹${totals.expenses}`,
    healthScore?.score != null ? `Spending health score: ${healthScore.score}/100` : null,
    biggestCategory
      ? `Highest spending category: ${biggestCategory.category} (₹${biggestCategory.amount}, ${biggestCategory.percentOfTotal}% of total spend)`
      : null,
    monthComparison?.changePercent != null
      ? `Change vs last month: ${monthComparison.changePercent}%${
          monthComparison.drivingCategory ? `, mainly driven by ${monthComparison.drivingCategory}` : ""
        }`
      : null,
    budgetAlerts?.length
      ? `Budget alerts: ${budgetAlerts.map((a) => a.message).join(" ")}`
      : null,
  ].filter(Boolean);

  return (
    "You are a personal finance assistant. Based only on the summary below, " +
    "write a short (3-4 sentence) plain-English insight for the user, ending with " +
    "one concrete, actionable suggestion. Be specific with numbers where you have them. " +
    "Do not invent any figures not given below.\n\n" +
    lines.join("\n")
  );
}

// GET /api/insights/ai?month=2026-08
router.get("/", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not set. Add it to server/.env to enable AI insights.",
      });
    }

    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const summary = await buildInsightsSummary(month);

    if (summary.totals.income === 0 && summary.totals.expenses === 0) {
      return res.json({ insight: "Add a few transactions this month and I'll be able to analyze your spending." });
    }

    const prompt = buildPrompt(summary);

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errBody);
      return res.status(502).json({ error: "AI service unavailable. Try again shortly." });
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      return res.status(502).json({ error: "AI service returned an empty response." });
    }

    res.json({ insight: text });
  } catch (err) {
    console.error("AI insight error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
