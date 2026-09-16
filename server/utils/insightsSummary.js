import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import {
  calculateHealthScore,
  biggestCategoryInsight,
  checkBudgetAlerts,
  compareMonths,
} from "./analyzer.js";

export function monthRange(monthStr) {
  const [year, mon] = monthStr.split("-").map(Number);
  const start = new Date(year, mon - 1, 1);
  const end = new Date(year, mon, 1);
  return { start, end };
}

export function previousMonthStr(monthStr, offset = 1) {
  const [year, mon] = monthStr.split("-").map(Number);
  const d = new Date(year, mon - 1 - offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function getMonthTransactions(monthStr) {
  const { start, end } = monthRange(monthStr);
  return Transaction.find({ date: { $gte: start, $lt: end } });
}

/**
 * Builds the full insights summary for a given month.
 * Shared by /api/insights (dashboard) and /api/insights/ai (AI summary),
 * so the AI route always analyzes the exact same numbers the user sees.
 */
export async function buildInsightsSummary(month) {
  const currentTx = await getMonthTransactions(month);

  const prevMonths = [1, 2, 3].map((o) => previousMonthStr(month, o));
  const prevTxLists = await Promise.all(prevMonths.map(getMonthTransactions));

  const previousMonth = previousMonthStr(month, 1);
  const previousTx = prevTxLists[0];

  const budgets = await Budget.find({ month });

  const health = calculateHealthScore(currentTx, prevTxLists.filter((l) => l.length > 0));
  const whereItGoes = biggestCategoryInsight(currentTx);
  const alerts = checkBudgetAlerts(currentTx, budgets);
  const comparison = compareMonths(currentTx, previousTx);

  return {
    month,
    previousMonth,
    healthScore: health,
    biggestCategory: whereItGoes,
    budgetAlerts: alerts.filter((a) => a.message),
    monthComparison: comparison,
    totals: {
      income: currentTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expenses: currentTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    },
  };
}
