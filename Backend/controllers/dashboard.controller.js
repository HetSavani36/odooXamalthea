import Expense, { ExpenseStatus } from "../models/expense.model.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getCompanyCurrencyCode = async (companyId) => {
  if (!companyId) {
    throw new ApiError(500, "Company ID is missing from user session.");
  }
  const company = await Company.findById(companyId)
    .select("currency.code")
    .lean();
  if (!company || !company.currency || !company.currency.code) {
    return "USD";
  }
  return company.currency.code;
};


const getEmployeeAnalytics = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId);

  const pipeline = [
    { $match: { employee: employeeId } },
    {
      $group: {
        _id: "$status",
        totalAmount: { $sum: "$amount" },
        currencyData: { $first: "$currency.code" },
      },
    },
  ];

  const rawStats = await Expense.aggregate(pipeline);

  const finalStats = {
    draft: 0,
    verifyApproval: 0,
    approved: 0,
    rejected: 0,
  };

  rawStats.forEach((stat) => {
    const convertedAmount = currencyConverter(
      stat.totalAmount,
      stat.currencyData,
      companyCurrencyCode
    );

    if (stat._id === ExpenseStatus.DRAFT) {
      finalStats.draft += convertedAmount;
    } else if (
      stat._id === ExpenseStatus.AWAITING_ADMIN_REVIEW ||
      stat._id === ExpenseStatus.AWAITING_APPROVAL
    ) {
      finalStats.verifyApproval += convertedAmount;
    } else if (stat._id === ExpenseStatus.APPROVED) {
      finalStats.approved += convertedAmount;
    } else if (stat._id === ExpenseStatus.REJECTED) {
      finalStats.rejected += convertedAmount;
    }
  });

  const result = {
    currency: companyCurrencyCode,
    draft: parseFloat(finalStats.draft.toFixed(2)),
    verifyApproval: parseFloat(finalStats.verifyApproval.toFixed(2)),
    approved: parseFloat(finalStats.approved.toFixed(2)),
    rejected: parseFloat(finalStats.rejected.toFixed(2)),
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Employee dashboard statistics retrieved successfully."
      )
    );
});

export { getEmployeeAnalytics };
