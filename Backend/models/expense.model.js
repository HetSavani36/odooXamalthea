import mongoose, { Schema } from "mongoose";

export const ExpenseStatus = Object.freeze({
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
});

const expenseSchema = new Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required."],
      validate: {
        validator: function (v) {
          return v <= Date.now();
        },
        message: "Expense date cannot be in the future.",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      enum: ["Food", "Travel", "Accommodation", "Software", "Other"], // Example enum
      trim: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remarks: {
      type: String,
      default: "None",
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required."],
      min: [0.01, "Amount must be greater than zero."],
    },
    currency: {
      code: { type: String },
      name: { type: String },
      symbol: { type: String },
    },
    status: {
      type: String,
      required: [true, "Status is required."],
      enum: Object.values(ExpenseStatus),
      default: ExpenseStatus.DRAFT,
    },
  },
  {
    timestamps: true,
  }
);

export const Expense = mongoose.model("Expense", expenseSchema);