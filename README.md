# SmartSpend — Personal Finance & Spending Analyzer

A MERN-stack expense tracker that goes beyond income/expense/balance by adding:

1. **Spending Health Score (0–100)** — weighted blend of savings rate, expense/income
   ratio, category concentration, and unusual spending vs. your recent average.
2. **"Where is my money going?"** — automatically surfaces your biggest expense
   category and what share of total spend it makes up.
3. **Overspending Alerts** — set a monthly budget per category; get warned at 80%
   usage and flagged when you exceed it.
4. **Month-over-month comparison** — shows % change vs last month and which
   category is driving it.

(Savings Goals and the AI insight endpoint are natural next additions — see
"Ideas for later" below.)

## Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React (Vite), plain fetch — no extra state library needed for this scope

## Project structure
```
smartspend/
  server/         Express API
    models/       Transaction, Budget (Mongoose schemas)
    routes/       transactions, budgets, insights
    utils/        analyzer.js — all the "smart" scoring/insight logic, pure functions
    server.js
  client/         React frontend (Vite)
    src/
      components/ HealthScoreCard, SpendingInsight, TransactionForm, TransactionList
      App.jsx
      api.js
```

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env       # adjust MONGO_URI if needed
npm run dev                # requires MongoDB running locally, or a MongoDB Atlas URI
```
API runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
App runs on `http://localhost:5173` and proxies `/api` calls to the backend.

### 3. MongoDB
Easiest local option: install MongoDB Community and run `mongod`, or use a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster and put its connection
string in `server/.env` as `MONGO_URI`.

## How the Health Score works
See `server/utils/analyzer.js` → `calculateHealthScore()`. It's deliberately a
pure function with no DB/Express dependency, so it's easy to unit test or tune
the weights:
- Savings rate — 40 pts (0% saved = 0, 30%+ saved = full marks)
- Expense/income ratio — 30 pts (spending ≥100% of income = 0)
- Category concentration — 20 pts (one category eating >70% of spend = 0)
- Unusual spending vs. last 3 months' average — 10 pts

## API summary
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/transactions?month=YYYY-MM` | list transactions for a month |
| POST | `/api/transactions` | add a transaction |
| DELETE | `/api/transactions/:id` | remove a transaction |
| GET | `/api/budgets?month=YYYY-MM` | list budgets for a month |
| POST | `/api/budgets` | set/update a category budget (upsert) |
| GET | `/api/insights?month=YYYY-MM` | health score, biggest category, alerts, comparison — everything the dashboard needs in one call |

## Ideas for later (kept out of day-1 scope on purpose)
- **Savings Goal tracker** — simple CRUD (goal name, target, saved-so-far) + a
  progress bar; add a `Goal` model and a `/api/goals` route mirroring `budgets.js`.
- **AI insight button** — a `/api/insights/ai` route that summarizes the month's
  transactions and sends them to an LLM for a plain-English recommendation.
  Keep the prompt to aggregated numbers only (don't send raw transaction notes)
  to keep it cheap and privacy-friendly.
- Category-level monthly comparison chart (currently only total + top driver).
