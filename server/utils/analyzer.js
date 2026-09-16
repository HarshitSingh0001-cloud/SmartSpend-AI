// Core "smart" logic for SmartSpend.
// Pure functions — take arrays of transactions/budgets, return computed insights.
// Keeping this framework-agnostic makes it easy to unit test.

/**
 * Group transactions by category and sum their amounts.
 */
function sumByCategory(transactions) {
  const map = {};
  for (const t of transactions) {
    map[t.category] = (map[t.category] || 0) + t.amount;
  }
  return map;
}

function totalByType(transactions, type) {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * 1. SPENDING HEALTH SCORE (0-100)
 * Weighted blend of four signals:
 *  - Savings rate        (40%) - how much of income is left over
 *  - Expense/income ratio (30%) - are you living within your means
 *  - Category concentration (20%) - is spend spread out or all in one bucket
 *  - Unusual spending     (10%) - is this month a spike vs recent average
 */
function calculateHealthScore(transactions, previousMonthsTransactions = []) {
  const income = totalByType(transactions, "income");
  const expenses = totalByType(transactions, "expense");

  if (income === 0 && expenses === 0) {
    return { score: null, breakdown: null, message: "Not enough data yet." };
  }

  // --- Savings rate score (40 pts) ---
  // 0% saved -> 0 pts, 30%+ saved -> full 40 pts, negative savings -> 0 pts
  const savingsRate = income > 0 ? (income - expenses) / income : -1;
  const savingsScore = Math.max(0, Math.min(1, savingsRate / 0.3)) * 40;

  // --- Expense/income ratio score (30 pts) ---
  // ratio <= 0.5 -> full marks, ratio >= 1 (spending all/more than income) -> 0
  const ratio = income > 0 ? expenses / income : 2;
  const ratioScore = Math.max(0, Math.min(1, (1 - ratio) / 0.5)) * 30;

  // --- Category concentration score (20 pts) ---
  // Uses the share of the single largest category. Well spread spending scores higher.
  const catTotals = sumByCategory(transactions.filter((t) => t.type === "expense"));
  const catValues = Object.values(catTotals);
  const largestCategoryShare =
    expenses > 0 && catValues.length ? Math.max(...catValues) / expenses : 0;
  // <=25% share -> full marks, >=70% share -> 0
  const concentrationScore =
    Math.max(0, Math.min(1, (0.7 - largestCategoryShare) / 0.45)) * 20;

  // --- Unusual spending score (10 pts) ---
  // Compare this month's expenses to the average of previous months.
  let unusualScore = 10; // default: no history, assume fine
  if (previousMonthsTransactions.length > 0) {
    const avgPrevExpense =
      previousMonthsTransactions.reduce(
        (sum, monthTx) => sum + totalByType(monthTx, "expense"),
        0
      ) / previousMonthsTransactions.length;

    if (avgPrevExpense > 0) {
      const increaseRatio = (expenses - avgPrevExpense) / avgPrevExpense;
      // 0% increase or a decrease -> full marks, 50%+ increase -> 0
      unusualScore = Math.max(0, Math.min(1, 1 - increaseRatio / 0.5)) * 10;
    }
  }

  const score = Math.round(
    savingsScore + ratioScore + concentrationScore + unusualScore
  );

  let tier = "🔴 Needs attention";
  if (score >= 75) tier = "🟢 Healthy";
  else if (score >= 50) tier = "🟡 Okay";

  return {
    score,
    tier,
    breakdown: {
      savingsScore: Math.round(savingsScore),
      ratioScore: Math.round(ratioScore),
      concentrationScore: Math.round(concentrationScore),
      unusualScore: Math.round(unusualScore),
    },
    savingsRate: Math.round(savingsRate * 100),
  };
}

/**
 * 2. "WHERE IS MY MONEY GOING" - biggest expense category this month
 */
function biggestCategoryInsight(transactions) {
  const expenses = transactions.filter((t) => t.type === "expense");
  const total = totalByType(transactions, "expense");
  if (total === 0) return null;

  const catTotals = sumByCategory(expenses);
  const [topCategory, topAmount] = Object.entries(catTotals).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const percent = Math.round((topAmount / total) * 100);

  return {
    category: topCategory,
    amount: topAmount,
    percentOfTotal: percent,
    message: `${topCategory} is your highest expense — you spent ₹${topAmount.toLocaleString(
      "en-IN"
    )} this month, ${percent}% of your total spending.`,
  };
}

/**
 * 3. OVERSPENDING ALERTS
 * Compares actual category spend this month against saved budgets.
 */
function checkBudgetAlerts(transactions, budgets) {
  const expenseTotals = sumByCategory(
    transactions.filter((t) => t.type === "expense")
  );

  return budgets
    .map((b) => {
      const spent = expenseTotals[b.category] || 0;
      const remaining = b.monthlyLimit - spent;
      const percentUsed = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
      const exceeded = spent > b.monthlyLimit;

      return {
        category: b.category,
        limit: b.monthlyLimit,
        spent,
        remaining: exceeded ? 0 : remaining,
        percentUsed,
        exceeded,
        message: exceeded
          ? `⚠️ You've exceeded your ${b.category} budget by ₹${(
              spent - b.monthlyLimit
            ).toLocaleString("en-IN")}.`
          : percentUsed >= 80
          ? `⚡ You're at ${percentUsed}% of your ${b.category} budget.`
          : null,
      };
    })
    .sort((a, b) => b.percentUsed - a.percentUsed);
}

/**
 * 4. MONTH-OVER-MONTH COMPARISON
 */
function compareMonths(currentTx, previousTx) {
  const currentTotal = totalByType(currentTx, "expense");
  const previousTotal = totalByType(previousTx, "expense");

  if (previousTotal === 0) {
    return { currentTotal, previousTotal, changePercent: null, drivingCategory: null };
  }

  const changePercent = Math.round(
    ((currentTotal - previousTotal) / previousTotal) * 100
  );

  // Find which category contributed most to the change
  const currentCats = sumByCategory(currentTx.filter((t) => t.type === "expense"));
  const previousCats = sumByCategory(previousTx.filter((t) => t.type === "expense"));

  let drivingCategory = null;
  let maxDelta = 0;
  const allCats = new Set([...Object.keys(currentCats), ...Object.keys(previousCats)]);
  for (const cat of allCats) {
    const delta = (currentCats[cat] || 0) - (previousCats[cat] || 0);
    if (Math.abs(delta) > Math.abs(maxDelta)) {
      maxDelta = delta;
      drivingCategory = cat;
    }
  }

  return {
    currentTotal,
    previousTotal,
    changePercent,
    drivingCategory,
    drivingCategoryDelta: maxDelta,
  };
}

export {
  sumByCategory,
  totalByType,
  calculateHealthScore,
  biggestCategoryInsight,
  checkBudgetAlerts,
  compareMonths,
};
