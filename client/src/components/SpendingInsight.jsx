export default function SpendingInsight({ biggestCategory, budgetAlerts, monthComparison }) {
  return (
    <div className="card">
      <h3>Where is my money going?</h3>

      {biggestCategory ? (
        <p className="insight-line">
          ⚠️ <strong>{biggestCategory.category}</strong> is your highest expense — ₹
          {biggestCategory.amount.toLocaleString("en-IN")} ({biggestCategory.percentOfTotal}% of
          total spending)
        </p>
      ) : (
        <p className="muted">No expenses recorded yet this month.</p>
      )}

      {monthComparison && monthComparison.changePercent !== null && (
        <p className="insight-line">
          {monthComparison.changePercent >= 0 ? "↑" : "↓"}{" "}
          {Math.abs(monthComparison.changePercent)}% vs last month
          {monthComparison.drivingCategory
            ? ` — mainly because of ${monthComparison.drivingCategory}`
            : ""}
          .
        </p>
      )}

      {budgetAlerts && budgetAlerts.length > 0 && (
        <div className="alerts">
          {budgetAlerts.map((a) => (
            <p key={a.category} className={`alert-line ${a.exceeded ? "alert-danger" : "alert-warn"}`}>
              {a.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
