import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import transactionRoutes from "./routes/transactions.js";
import budgetRoutes from "./routes/budgets.js";
import insightRoutes from "./routes/insights.js";
import aiInsightRoutes from "./routes/aiInsight.js";

dotenv.config();

const app = express();
// In production, set CLIENT_URL to your deployed frontend, e.g. https://smartspend.vercel.app
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/insights/ai", aiInsightRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartspend";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`SmartSpend API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
