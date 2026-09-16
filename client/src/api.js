// In production, set VITE_API_URL to your deployed backend, e.g. https://smartspend-api.onrender.com/api
// Locally this falls back to the relative "/api" path, which Vite proxies to localhost:5000.
const BASE = import.meta.env.VITE_API_URL || "/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getTransactions: (month) =>
    fetch(`${BASE}/transactions?month=${month}`).then(handle),

  addTransaction: (data) =>
    fetch(`${BASE}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),

  deleteTransaction: (id) =>
    fetch(`${BASE}/transactions/${id}`, { method: "DELETE" }).then(handle),

  getBudgets: (month) => fetch(`${BASE}/budgets?month=${month}`).then(handle),

  setBudget: (data) =>
    fetch(`${BASE}/budgets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),

  getInsights: (month) => fetch(`${BASE}/insights?month=${month}`).then(handle),

  getAIInsight: (month) => fetch(`${BASE}/insights/ai?month=${month}`).then(handle),
};
