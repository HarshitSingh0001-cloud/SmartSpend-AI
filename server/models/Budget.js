import mongoose from "mongoose";

// One budget cap per category, per calendar month ("YYYY-MM")
const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    monthlyLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: String, // "2026-08"
      required: true,
    },
  },
  { timestamps: true }
);

budgetSchema.index({ category: 1, month: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
