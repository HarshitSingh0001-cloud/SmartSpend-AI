export default function TransactionList({ transactions, onDelete }) {
  return (
    <div className="card">
      <h3>Transactions</h3>
      {transactions.length === 0 && <p className="muted">No transactions this month yet.</p>}
      <ul className="tx-list">
        {transactions.map((t) => (
          <li key={t._id} className={`tx-item ${t.type}`}>
            <div>
              <span className="tx-category">{t.category}</span>
              {t.note && <span className="tx-note"> — {t.note}</span>}
              <div className="tx-date">{new Date(t.date).toLocaleDateString("en-IN")}</div>
            </div>
            <div className="tx-right">
              <span className={`tx-amount ${t.type}`}>
                {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
              </span>
              <button className="tx-delete" onClick={() => onDelete(t._id)}>
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
