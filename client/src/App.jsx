import { useEffect, useState, useCallback } from "react";
import { api } from "./api";
import HealthScoreCard from "./components/HealthScoreCard";
import SpendingInsight from "./components/SpendingInsight";
import AIInsightCard from "./components/AIInsightCard";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function App() {
  const [month] = useState(currentMonth());
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [tx, ins] = await Promise.all([
        api.getTransactions(month),
        api.getInsights(month),
      ]);
      setTransactions(tx);
      setInsights(ins);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleAdd(data) {
    await api.addTransaction({ ...data, date: new Date().toISOString() });
    loadAll();
  }

  async function handleDelete(id) {
    await api.deleteTransaction(id);
    loadAll();
  }

  const totals = insights?.totals || { income: 0, expenses: 0 };
  const balance = totals.income - totals.expenses;

  return (
    <div className="app">
      <header>
        <h1>SmartSpend</h1>
        <p className="tagline">Personal Finance & Spending Analyzer</p>
      </header>

      {error && <p className="error">⚠️ {error} — is the backend running on :5000?</p>}

      <section className="totals-row">
        <div className="card total-card">
          <span className="muted">Income</span>
          <span className="total-amount income">₹{totals.income.toLocaleString("en-IN")}</span>
        </div>
        <div className="card total-card">
          <span className="muted">Expenses</span>
          <span className="total-amount expense">₹{totals.expenses.toLocaleString("en-IN")}</span>
        </div>
        <div className="card total-card">
          <span className="muted">Balance</span>
          <span className={`total-amount ${balance >= 0 ? "income" : "expense"}`}>
            ₹{balance.toLocaleString("en-IN")}
          </span>
        </div>
      </section>

      {!loading && insights && (
        <section className="insights-row">
          <HealthScoreCard healthScore={insights.healthScore} />
          <SpendingInsight
            biggestCategory={insights.biggestCategory}
            budgetAlerts={insights.budgetAlerts}
            monthComparison={insights.monthComparison}
          />
        </section>
      )}

      <section className="ai-row">
        <AIInsightCard month={month} />
      </section>

      <section className="main-row">
        <TransactionForm onAdd={handleAdd} />
        <TransactionList transactions={transactions} onDelete={handleDelete} />
      </section>
    </div>
  );
}
