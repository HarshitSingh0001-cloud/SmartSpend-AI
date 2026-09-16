import { useState } from "react";

const EXPENSE_CATEGORIES = [
  "Food",
  "Travel",
  "Rent",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Other",
];

const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Gift", "Other"];

export default function TransactionForm({ onAdd }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState("");

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleTypeChange(newType) {
    setType(newType);
    // reset category to a sensible default whenever the type switches,
    // so you can't submit an expense-only category under Income (or vice versa)
    setCategory(newType === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    onAdd({ type, amount: Number(amount), category, note });
    setAmount("");
    setNote("");
  }

  return (
    <form className="card tx-form" onSubmit={handleSubmit}>
      <h3>Add Transaction</h3>
      <div className="form-row">
        <label>
          <input
            type="radio"
            checked={type === "expense"}
            onChange={() => handleTypeChange("expense")}
          />
          Expense
        </label>
        <label>
          <input
            type="radio"
            checked={type === "income"}
            onChange={() => handleTypeChange("income")}
          />
          Income
        </label>
      </div>

      <input
        type="number"
        placeholder="Amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0"
        step="0.01"
        required
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button type="submit">Add</button>
    </form>
  );
}
