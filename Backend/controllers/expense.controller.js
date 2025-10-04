import Expense, { ExpenseStatus } from "../models/expense.model.js";
import { User } from "../models/user.model.js"; // Assuming named export 'User'
import { Company } from "../models/company.model.js"; // <<< NEW: Imported Company Model >>>
import { asyncHandler } from "../utils/asyncHandler.js"; // Assuming this utility exists
import ApiError from "../utils/ApiError.js"; // Assuming this utility exists
import ApiResponse from "../utils/ApiResponse.js"; // Assuming this utility exists
import mongoose from "mongoose";

// =====================================================================
// CURRENCY AND REPORTING HELPERS (Simulated Exchange Service)
// =====================================================================

// NOTE: Fixed COMPANY_CURRENCY is removed. It is now fetched dynamically.

// Static exchange rates for demonstration (1 unit of source currency per 1 unit of USD)
const EXCHANGE_RATES = {
  USD: 1.0, // Base
  INR: 83.0, // 1 USD = 83 INR
  EUR: 0.92, // 1 USD = 0.92 EUR
  GBP: 0.81, // 1 USD = 0.81 GBP
};

/**
 * Helper to fetch the company's default currency code.
 */
const getCompanyCurrencyCode = async (companyId) => {
  if (!companyId) {
    throw new ApiError(500, "Company ID is missing from user session.");
  }
  const company = await Company.findById(companyId)
    .select("currency.code")
    .lean();
  if (!company || !company.currency || !company.currency.code) {
    // Fallback to a common default if database is incomplete, but throw error in production environment.
    return "USD";
  }
  return company.currency.code;
};

/**
 * Converts amount from source currency to target currency.
 * @param {number} amount
 * @param {string} sourceCode
 * @param {string} targetCode - Dynamically fetched company currency code
 */
const currencyConverter = (amount, sourceCode, targetCode) => {
  if (sourceCode === targetCode) return amount; // We assume all rates in EXCHANGE_RATES are relative to a base (like USD=1.0)

  const baseCurrency = "USD"; // Assumed base currency for static rates

  const sourceRate = EXCHANGE_RATES[sourceCode] || 1;
  const targetRate = EXCHANGE_RATES[targetCode] || 1;

  if (sourceRate === 0)
    throw new Error(`Invalid exchange rate for source currency: ${sourceCode}`); // Step 1: Convert source currency to the base currency (USD)

  const amountInBase =
    amount / (EXCHANGE_RATES[sourceCode] / EXCHANGE_RATES[baseCurrency]); // Step 2: Convert base currency to the target currency

  const convertedAmount =
    amountInBase * (EXCHANGE_RATES[targetCode] / EXCHANGE_RATES[baseCurrency]);

  return parseFloat(convertedAmount.toFixed(2));
};

/**
 * Attaches the converted amount (in company currency) to an expense object.
 * @param {object} expense - The expense document or object
 * @param {string} companyCurrencyCode - The target currency code (e.g., 'EUR')
 */
const attachConvertedAmount = (expense, companyCurrencyCode) => {
  // Clone the expense object if it's a Mongoose document to avoid mutation issues
  const exp = expense.toObject ? expense.toObject() : { ...expense };

  try {
    const convertedAmount = currencyConverter(
      exp.amount,
      exp.currency.code,
      companyCurrencyCode
    );

    exp.reportingAmount = {
      amount: convertedAmount,
      currency: companyCurrencyCode, // <<< DYNAMIC CURRENCY >>>
      original: {
        amount: exp.amount,
        code: exp.currency.code,
      },
    };
    return exp;
  } catch (e) {
    // If conversion fails (e.g., rate missing), return the expense with an error tag
    exp.reportingError = `Conversion failed: ${e.message}`;
    return exp;
  }
};

/**
 * Simulates fetching IDs of users who report directly to the manager.
 */
const getDirectReports = async (managerId) => {
  // Find all users where the current managerId is their manager
  const reports = await User.find({ managerId: managerId })
    .select("_id")
    .lean();
  return reports.map((report) => report._id);
};

/**
 * Mongoose population helper using robust array syntax.
 * Populates employee, paidBy, and the approver in each step.
 */
const populateExpense = (query) => {
  return query.populate([
    { path: "employee", select: "name email managerId" },
    { path: "paidBy", select: "name email" },
    { path: "approvalSteps.approver", select: "name email" },
  ]);
};

/**
 * Checks if the final conditional approval threshold (Percentage/Specific/Hybrid) is met.
 * This function is called immediately after every approval vote.
 */
const checkFinalApprovalRule = (expense) => {
  const { approvalRule, approvalSteps } = expense;
  if (!approvalRule || approvalSteps.length === 0) return false;

  const totalApprovers = approvalSteps.length; // Important: Filter checks votes that are already 'Approved'
  const approvedSteps = approvalSteps.filter(
    (step) => step.status === "Approved"
  );
  const specificApprovers = approvalRule.specificApprovers || []; // 1. Check Percentage Rule

  let percentageMet = false;
  if (approvalRule.type === "Percentage" || approvalRule.type === "Hybrid") {
    const requiredApprovals = Math.ceil(
      totalApprovers * (approvalRule.percentage / 100)
    );
    if (approvedSteps.length >= requiredApprovals) {
      percentageMet = true;
    }
  } // 2. Check Specific Approver Rule

  let specificMet = false;
  if (approvalRule.type === "Specific" || approvalRule.type === "Hybrid") {
    specificMet = approvedSteps.some((step) =>
      specificApprovers.some((specificId) => specificId.equals(step.approver))
    );
  } // Final Rule Check

  if (approvalRule.type === "Percentage") return percentageMet;
  if (approvalRule.type === "Specific") return specificMet;
  if (approvalRule.type === "Hybrid") return percentageMet || specificMet;

  return false; // Default safe exit
};

// =====================================================================
// 1. EMPLOYEE/GENERAL CRUD CONTROLLERS
// =====================================================================

/**
 * @desc    Get all expenses owned by the authenticated user
 * @route   GET /api/v1/expenses
 * @access  Private (Employee)
 */
export const getExpenses = asyncHandler(async (req, res, next) => {
  const employeeId = req.user._id;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); // <<< DYNAMIC FETCH >>>

  const expenses = await populateExpense(
    Expense.find({ employee: employeeId })
  ).sort({ date: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      expenses.map((e) => attachConvertedAmount(e, companyCurrencyCode)), // <<< PASS CODE >>>
      "User expenses fetched successfully."
    )
  );
});

/**
 * @desc    Get single expense by ID
 * @route   GET /api/v1/expenses/:id
 * @access  Private (Employee)
 */
export const getExpense = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, `Invalid expense ID format: ${req.params.id}`);
  }
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); // <<< DYNAMIC FETCH >>>

  const expense = await populateExpense(
    Expense.findOne({ _id: req.params.id, employee: req.user._id })
  ).exec();

  if (!expense) {
    throw new ApiError(
      404,
      `Expense not found or you are not authorized to view it.`
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      attachConvertedAmount(expense, companyCurrencyCode), // <<< PASS CODE >>>
      "Expense fetched successfully."
    )
  );
});

/**
 * @desc    Create new expense (Save as Draft or Submit)
 * @route   POST /api/v1/expenses
 * @access  Private
 */
export const createExpense = asyncHandler(async (req, res, next) => {
  const {
    description,
    date,
    category,
    paidBy,
    remarks,
    amount,
    currency,
    isSubmitted = false,
  } = req.body; // Use the authenticated user as the employee

  const employeeId = req.user._id;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); // <<< DYNAMIC FETCH >>> // Validate Payer ID existence and format

  if (!paidBy || !mongoose.Types.ObjectId.isValid(paidBy)) {
    throw new ApiError(400, "Valid Payer ID is required.");
  }
  const payerExists = await User.findById(paidBy).select("_id");
  if (!payerExists) {
    throw new ApiError(400, `Payer ID '${paidBy}' not found.`);
  } // Set initial status based on client flag

  const initialStatus = isSubmitted
    ? ExpenseStatus.AWAITING_ADMIN_REVIEW
    : ExpenseStatus.DRAFT;

  const expense = await Expense.create({
    employee: employeeId,
    description,
    date,
    category,
    paidBy,
    remarks,
    amount,
    currency,
    status: initialStatus,
    currentStepIndex: -1,
    approvalSteps: [],
  });

  const createdExpense = await populateExpense(
    Expense.findById(expense._id)
  ).exec();

  return res.status(201).json(
    new ApiResponse(
      201,
      attachConvertedAmount(createdExpense, companyCurrencyCode), // <<< PASS CODE >>>
      `Expense successfully ${isSubmitted ? "submitted" : "saved as draft"}.`
    )
  );
});

/**
 * @desc    Update expense (Only if Draft)
 * @route   PUT /api/v1/expenses/:id
 * @access  Private
 */
export const updateExpense = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, `Invalid expense ID format: ${req.params.id}`);
  }
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); // <<< DYNAMIC FETCH >>>

  let expense = await Expense.findOne({
    _id: req.params.id,
    employee: req.user._id,
  });

  if (!expense) {
    throw new ApiError(
      404,
      `Expense not found or you are not authorized to update it.`
    );
  }

  if (expense.status !== ExpenseStatus.DRAFT) {
    throw new ApiError(
      403,
      `Cannot update. Expense is currently in '${expense.status}' status. Only 'Draft' expenses can be modified.`
    );
  } // Only allow updating fields that are appropriate for a draft

  const allowedUpdates = [
    "description",
    "date",
    "category",
    "paidBy",
    "remarks",
    "amount",
    "currency",
  ];
  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  expense = await Expense.findByIdAndUpdate(expense._id, updates, {
    new: true,
    runValidators: true,
  }).exec();

  const updatedExpense = await populateExpense(
    Expense.findById(expense._id)
  ).exec();

  return res.status(200).json(
    new ApiResponse(
      200,
      attachConvertedAmount(updatedExpense, companyCurrencyCode), // <<< PASS CODE >>>
      "Expense successfully updated."
    )
  );
});

/**
 * @desc    Delete expense (Only if Draft)
 * @route   DELETE /api/v1/expenses/:id
 * @access  Private
 */
export const deleteExpense = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, `Invalid expense ID format: ${req.params.id}`);
  }

  const expense = await Expense.findOne({
    _id: req.params.id,
    employee: req.user._id,
  });

  if (!expense) {
    throw new ApiError(
      404,
      `Expense not found or you are not authorized to delete it.`
    );
  }

  if (expense.status !== ExpenseStatus.DRAFT) {
    throw new ApiError(
      403,
      `Cannot delete. Expense is currently in '${expense.status}' status. Only 'Draft' expenses can be deleted.`
    );
  }

  await Expense.deleteOne({ _id: req.params.id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Expense successfully deleted."));
});

/**
 * @desc    Submit a Draft expense (Status change to AWAITING_ADMIN_REVIEW)
 * @route   PUT /api/v1/expenses/:id/submit
 * @access  Private
 */
export const submitExpense = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, `Invalid expense ID format: ${req.params.id}`);
  }
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); // <<< DYNAMIC FETCH >>>

  const expense = await Expense.findOne({
    _id: req.params.id,
    employee: req.user._id,
  });

  if (!expense) {
    throw new ApiError(
      404,
      `Expense not found or you are not authorized to submit it.`
    );
  }

  if (expense.status !== ExpenseStatus.DRAFT) {
    throw new ApiError(
      400,
      `Expense is already ${expense.status}. Only DRAFT can be submitted.`
    );
  }

  expense.status = ExpenseStatus.AWAITING_ADMIN_REVIEW;
  await expense.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      attachConvertedAmount(expense, companyCurrencyCode), // <<< PASS CODE >>>
      "Expense submitted. Awaiting Admin to assign approval workflow."
    )
  );
});

// =====================================================================
// 2. MANAGER/APPROVER CONTROLLERS
// =====================================================================

/**
 * @desc    Get expenses waiting for the authenticated user's approval
 * @route   GET /api/v1/approvals/pending
 * @access  Private (Managers/Approvers)
 */
export const getPendingApprovals = asyncHandler(async (req, res, next) => {
  const managerId = req.user._id;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); // <<< DYNAMIC FETCH >>> // Find expenses that are 'Awaiting Approval' and have the current user in the steps

  const pendingExpenses = await populateExpense(
    Expense.find({
      status: ExpenseStatus.AWAITING_APPROVAL,
      "approvalSteps.approver": managerId,
    })
  ).lean(); // Use lean() for faster read // Filter to ensure it is EXACTLY the current step's turn

  const expensesForUser = pendingExpenses
    .filter((expense) => {
      const currentStep = expense.approvalSteps[expense.currentStepIndex]; // Check if the current step exists, belongs to this manager, and is still pending
      return (
        currentStep &&
        currentStep.approver._id.equals(managerId) &&
        currentStep.status === "Pending"
      );
    })
    .map((e) => attachConvertedAmount(e, companyCurrencyCode)); // <<< PASS CODE >>>

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        expensesForUser,
        "Pending approvals fetched successfully."
      )
    );
});

/**
 * @desc    Get all expenses submitted by the current manager's reports (team)
 * @route   GET /api/v1/approvals/team
 * @access  Private (Managers/Approvers)
 */
export const getTeamExpenses = asyncHandler(async (req, res, next) => {
  const managerId = req.user._id;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); // <<< DYNAMIC FETCH >>> // 1. Get the IDs of the manager's direct reports

  const reportIds = await getDirectReports(managerId);

  if (reportIds.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, [], "No direct reports found with filed expenses.")
      );
  } // 2. Find all expenses filed by those reports

  const teamExpenses = await populateExpense(
    Expense.find({
      employee: { $in: reportIds },
    })
  ).sort({ date: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      teamExpenses.map((e) => attachConvertedAmount(e, companyCurrencyCode)), // <<< PASS CODE >>>
      "Team expenses fetched successfully."
    )
  );
});

/**
 * @desc    View single expense with currency conversion and team access check
 * @route   GET /api/v1/approvals/:id
 * @access  Private (Managers/Approvers)
 */
export const getReportedExpense = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, `Invalid expense ID format: ${req.params.id}`);
  }
  const managerId = req.user._id;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); // <<< DYNAMIC FETCH >>>

  let expense = await populateExpense(Expense.findById(req.params.id)).exec();

  if (!expense) {
    throw new ApiError(404, `Expense not found.`);
  } // Check 1: Is the user the current approver?

  const currentStep = expense.approvalSteps[expense.currentStepIndex];
  const isCurrentApprover =
    currentStep && currentStep.approver.equals(managerId); // Check 2: Is the user the manager of the employee who filed it? (Team View access)

  const isTeamManager =
    expense.employee.managerId && expense.employee.managerId.equals(managerId); // Check 3: Is the user an admin (this is usually checked by role middleware)

  const isAdmin = req.user.role === "admin"; // If none of the allowed roles apply, deny access

  if (!isCurrentApprover && !isTeamManager && !isAdmin) {
    throw new ApiError(403, "Not authorized to view this expense report.");
  } // Apply currency conversion before sending

  return res.status(200).json(
    new ApiResponse(
      200,
      attachConvertedAmount(expense, companyCurrencyCode), // <<< PASS CODE >>>
      "Expense report fetched for approval/review."
    )
  );
});

/**
 * @desc    Approve an expense step (Triggers immediate final approval if threshold is met)
 * @route   PUT /api/v1/approvals/:id/approve
 * @access  Private (Managers/Approvers)
 */
export const approveExpense = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, `Invalid expense ID format: ${req.params.id}`);
  }
  const managerId = req.user._id;
  const { comments } = req.body;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); // <<< DYNAMIC FETCH >>>

  let expense = await Expense.findById(req.params.id);

  if (!expense) {
    throw new ApiError(404, `Expense not found.`);
  }

  if (expense.status !== ExpenseStatus.AWAITING_APPROVAL) {
    throw new ApiError(
      400,
      `Cannot approve. Expense is in ${expense.status} status.`
    );
  }

  const currentStep = expense.approvalSteps[expense.currentStepIndex]; // 1. Authorization Check: Is it this manager's turn?

  if (
    !currentStep ||
    !currentStep.approver.equals(managerId) ||
    currentStep.status !== "Pending"
  ) {
    throw new ApiError(
      403,
      "Not authorized or not your turn to approve this expense."
    );
  } // 2. Perform Approval on the current step

  currentStep.status = "Approved";
  currentStep.comments = comments || "Approved.";
  currentStep.approvalDate = new Date();

  let finalMessage = "Expense approved. Workflow advanced."; // --- LOGIC: IMMEDIATE CONDITIONAL CHECK ---
  if (checkFinalApprovalRule(expense)) {
    // Threshold met! Override sequential flow and finalize immediately.
    expense.status = ExpenseStatus.APPROVED;
    finalMessage = "Expense APPROVED: Conditional threshold met early."; // Set currentStepIndex to the end to signify completion
    expense.currentStepIndex = expense.approvalSteps.length;
  } else {
    // Threshold not met. Check if we need to escalate or finalize as rejected (if sequence ends).
    const nextIndex = expense.currentStepIndex + 1;
    const nextStep = expense.approvalSteps[nextIndex];

    if (nextStep) {
      // Escalate to the next sequential approver
      expense.currentStepIndex = nextIndex; // Status remains AWAITING_APPROVAL
    } else {
      // End of sequential steps reached, and rule was NOT met. Final status is REJECTED.
      expense.status = ExpenseStatus.REJECTED;
      finalMessage =
        "Expense REJECTED: All sequential steps complete, but conditional rules were not met.";
    }
  } // --- END LOGIC ---
  await expense.save({ validateBeforeSave: false }); // 4. Repopulate and Respond

  expense = await populateExpense(Expense.findById(expense._id)).exec();
  return res.status(200).json(
    new ApiResponse(
      200,
      attachConvertedAmount(expense, companyCurrencyCode), // <<< PASS CODE >>>
      finalMessage
    )
  );
});

/**
 * @desc    Reject an expense step
 * @route   PUT /api/v1/approvals/:id/reject
 * @access  Private (Managers/Approvers)
 */
export const rejectExpense = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, `Invalid expense ID format: ${req.params.id}`);
  }
  const managerId = req.user._id;
  const { comments } = req.body;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); // <<< DYNAMIC FETCH >>>

  let expense = await Expense.findById(req.params.id);

  if (!expense) {
    throw new ApiError(404, `Expense not found.`);
  }

  if (expense.status !== ExpenseStatus.AWAITING_APPROVAL) {
    throw new ApiError(
      400,
      `Cannot reject. Expense is in ${expense.status} status.`
    );
  }

  const currentStep = expense.approvalSteps[expense.currentStepIndex]; // 1. Authorization Check: Is it this manager's turn?

  if (
    !currentStep ||
    !currentStep.approver.equals(managerId) ||
    currentStep.status !== "Pending"
  ) {
    throw new ApiError(
      403,
      "Not authorized or not your turn to reject this expense."
    );
  } // 2. Perform Rejection

  currentStep.status = "Rejected";
  currentStep.comments = comments || "Rejected.";
  currentStep.approvalDate = new Date(); // 3. Finalize Expense as Rejected (Rejection stops the entire sequential flow)

  expense.status = ExpenseStatus.REJECTED;
  expense.currentStepIndex = expense.approvalSteps.length;

  await expense.save({ validateBeforeSave: false }); // 4. Repopulate and Respond

  expense = await populateExpense(Expense.findById(expense._id)).exec();
  return res.status(200).json(
    new ApiResponse(
      200,
      attachConvertedAmount(expense, companyCurrencyCode), // <<< PASS CODE >>>
      "Expense rejected. Workflow terminated."
    )
  );
});

// =====================================================================
// 3. ADMIN CONTROLLERS
// =====================================================================

/**
 * @desc    Admin assigns the approval workflow to a submitted expense.
 * @route   POST /api/v1/admin/expenses/:id/assign-workflow
 * @access  Private (Admin Role Required - assumed check via middleware)
 */
export const assignWorkflow = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, `Invalid expense ID format: ${req.params.id}`);
  }

  const {
    approvalSteps: customSteps,
    approvalRule,
    managerApprovalRequired,
  } = req.body;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); // <<< DYNAMIC FETCH >>>

  if (!customSteps || !Array.isArray(customSteps) || customSteps.length === 0) {
    throw new ApiError(
      400,
      "Custom approval steps (approver IDs) are required."
    );
  }

  if (
    !approvalRule ||
    !["Percentage", "Specific", "Hybrid"].includes(approvalRule.type)
  ) {
    throw new ApiError(
      400,
      "A valid approvalRule object with a type (Percentage, Specific, or Hybrid) is required."
    );
  }

  let expense = await populateExpense(Expense.findById(req.params.id)).exec();

  if (!expense) {
    throw new ApiError(404, "Expense not found.");
  }

  if (expense.status !== ExpenseStatus.AWAITING_ADMIN_REVIEW) {
    throw new ApiError(
      400,
      `Workflow can only be assigned to expenses in '${ExpenseStatus.AWAITING_ADMIN_REVIEW}' status.`
    );
  }

  let finalSteps = [];
  let sequence = 0; // 1. Check for Manager Approval Rule (If requested, prepend the manager)

  if (managerApprovalRequired) {
    const employeeUser = await User.findById(expense.employee._id)
      .select("managerId")
      .lean();

    if (employeeUser && employeeUser.managerId) {
      finalSteps.push({
        approver: employeeUser.managerId,
        sequence: sequence++,
        status: "Pending",
      });
    } else {
      throw new ApiError(
        400,
        "Manager approval is required, but employee manager ID is missing in the User record."
      );
    }
  } // 2. Validate and add custom steps provided by the Admin

  for (const approverId of customSteps) {
    if (!mongoose.Types.ObjectId.isValid(approverId)) {
      throw new ApiError(400, `Invalid approver ID format: ${approverId}`);
    }
    const approverExists = await User.findById(approverId).select("_id");
    if (!approverExists) {
      throw new ApiError(400, `Approver ID ${approverId} not found.`);
    }

    finalSteps.push({
      approver: approverId,
      sequence: sequence++,
      status: "Pending",
    });
  } // 3. Update the expense with the new workflow

  expense.approvalSteps = finalSteps;
  expense.approvalRule = approvalRule;
  expense.currentStepIndex = 0; // Start at the very first step (index 0)
  expense.status = ExpenseStatus.AWAITING_APPROVAL;

  await expense.save();
  expense = await populateExpense(Expense.findById(expense._id)).exec(); // Repopulate after save

  return res.status(200).json(
    new ApiResponse(
      200,
      attachConvertedAmount(expense, companyCurrencyCode), // <<< PASS CODE >>>
      "Approval workflow successfully assigned and initiated."
    )
  );
});
