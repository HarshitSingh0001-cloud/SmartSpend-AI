import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      // e.g. Food, Travel, Rent, Shopping, Bills, Entertainment, Salary, Other
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Helpful indexes for the monthly / category queries the insights engine runs
transactionSchema.index({ date: 1 });
transactionSchema.index({ category: 1 });

export default mongoose.model("Transaction", transactionSchema);
