export default function HealthScoreCard({ healthScore }) {
  if (!healthScore || healthScore.score == null) {
    return (
      <div className="card">
        <h3>Spending Health</h3>
        <p className="muted">Add some transactions to see your score.</p>
      </div>
    );
  }

  const { score, tier, breakdown, savingsRate } = healthScore;

  return (
    <div className="card health-card">
      <h3>Spending Health</h3>
      <div className="score-row">
        <span className="score-number">{score}</span>
        <span className="score-max">/100</span>
        <span className="score-tier">{tier}</span>
      </div>
      <p className="muted">You saved {savingsRate}% of your income this month.</p>
      <div className="breakdown">
        <BreakdownBar label="Savings rate" value={breakdown.savingsScore} max={40} />
        <BreakdownBar label="Expense/income ratio" value={breakdown.ratioScore} max={30} />
        <BreakdownBar label="Category spread" value={breakdown.concentrationScore} max={20} />
        <BreakdownBar label="Vs. recent average" value={breakdown.unusualScore} max={10} />
      </div>
    </div>
  );
}

function BreakdownBar({ label, value, max }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="breakdown-row">
      <div className="breakdown-label">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
