import mongoose, { Schema } from "mongoose";

export const ExpenseStatus = Object.freeze({
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
});

const ApprovalStepSchema = new Schema({
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sequence: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  comments: { type: String },
  approvalDate: { type: Date },
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
      enum: [
        "Draft",
        "Awaiting Admin Review",
        "Awaiting Approval",
        "Approved",
        "Rejected",
      ],
      default: "Draft",
    },
    currentStepIndex: { type: Number, default: -1 }, // -1 means no active step yet (Awaiting Admin Review)
    approvalSteps: [ApprovalStepSchema],
    approvalRule: {
      type: {
        type: String,
        enum: ["Percentage", "Specific", "Hybrid"],
        default: "Percentage",
      },
      percentage: { type: Number, min: 1, max: 100, default: 100 },
      specificApprovers: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      ],
      managerApprovalRequired: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense