import Expense, { ExpenseStatus } from "../models/expense.model.js";
import { User } from "../models/user.model.js"; 
import { Company } from "../models/company.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"; 
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const EXCHANGE_RATES = {
  USD: 1.0, 
  INR: 83.0, 
  EUR: 0.92, 
  GBP: 0.81, 
};

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


const currencyConverter = (amount, sourceCode, targetCode) => {
  if (sourceCode === targetCode) return amount;
  const baseCurrency = "USD"; 
  const sourceRate = EXCHANGE_RATES[sourceCode] || 1;
  const targetRate = EXCHANGE_RATES[targetCode] || 1;

  if (sourceRate === 0)
    throw new Error(`Invalid exchange rate for source currency: ${sourceCode}`);
  const amountInBase =
    amount / (EXCHANGE_RATES[sourceCode] / EXCHANGE_RATES[baseCurrency]); 

  const convertedAmount =
    amountInBase * (EXCHANGE_RATES[targetCode] / EXCHANGE_RATES[baseCurrency]);

  return parseFloat(convertedAmount.toFixed(2));
};


const attachConvertedAmount = (expense, companyCurrencyCode) => {
  const exp = expense.toObject ? expense.toObject() : { ...expense };

  try {
    const convertedAmount = currencyConverter(
      exp.amount,
      exp.currency.code,
      companyCurrencyCode
    );

    exp.reportingAmount = {
      amount: convertedAmount,
      currency: companyCurrencyCode, 
      original: {
        amount: exp.amount,
        code: exp.currency.code,
      },
    };
    return exp;
  } catch (e) {
    exp.reportingError = `Conversion failed: ${e.message}`;
    return exp;
  }
};

const getDirectReports = async (managerId) => {
  const reports = await User.find({ managerId: managerId })
    .select("_id")
    .lean();
  return reports.map((report) => report._id);
};

const populateExpense = (query) => {
  return query.populate([
    { path: "employee", select: "name email managerId" },
    { path: "paidBy", select: "name email" },
    { path: "approvalSteps.approver", select: "name email" },
  ]);
};


const checkFinalApprovalRule = (expense) => {
  const { approvalRule, approvalSteps } = expense;
  if (!approvalRule || approvalSteps.length === 0) return false;

  const totalApprovers = approvalSteps.length;
  const approvedSteps = approvalSteps.filter(
    (step) => step.status === "Approved"
  );
  const specificApprovers = approvalRule.specificApprovers || []; 

  let percentageMet = false;
  if (approvalRule.type === "Percentage" || approvalRule.type === "Hybrid") {
    const requiredApprovals = Math.ceil(
      totalApprovers * (approvalRule.percentage / 100)
    );
    if (approvedSteps.length >= requiredApprovals) {
      percentageMet = true;
    }
  } 
  
  let specificMet = false;
  if (approvalRule.type === "Specific" || approvalRule.type === "Hybrid") {
    specificMet = approvedSteps.some((step) =>
      specificApprovers.some((specificId) => specificId.equals(step.approver))
    );
  }
  
  if (approvalRule.type === "Percentage") return percentageMet;
  if (approvalRule.type === "Specific") return specificMet;
  if (approvalRule.type === "Hybrid") return percentageMet || specificMet;

  return false; 
};


export const getExpenses = asyncHandler(async (req, res, next) => {
  const employeeId = req.user._id;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); 

  const expenses = await populateExpense(
    Expense.find({ employee: employeeId })
  ).sort({ date: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      expenses.map((e) => attachConvertedAmount(e, companyCurrencyCode)), 
      "User expenses fetched successfully."
    )
  );
});

export const getExpense = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, `Invalid expense ID format: ${req.params.id}`);
  }
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); 

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
      attachConvertedAmount(expense, companyCurrencyCode), 
      "Expense fetched successfully."
    )
  );
});


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
  } = req.body; 

  const employeeId = req.user._id;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); 

  if (!paidBy || !mongoose.Types.ObjectId.isValid(paidBy)) {
    throw new ApiError(400, "Valid Payer ID is required.");
  }
  const payerExists = await User.findById(paidBy).select("_id");
  if (!payerExists) {
    throw new ApiError(400, `Payer ID '${paidBy}' not found.`);
  } 

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
      attachConvertedAmount(createdExpense, companyCurrencyCode),
      `Expense successfully ${isSubmitted ? "submitted" : "saved as draft"}.`
    )
  );
});

 
export const updateExpense = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, `Invalid expense ID format: ${req.params.id}`);
  }
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); 

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
  } 

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
      attachConvertedAmount(updatedExpense, companyCurrencyCode), 
      "Expense successfully updated."
    )
  );
});

 
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


export const getTeamExpenses = asyncHandler(async (req, res, next) => {
  const managerId = req.user._id;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); 

  const reportIds = await getDirectReports(managerId);

  if (reportIds.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, [], "No direct reports found with filed expenses.")
      );
  } 

  const teamExpenses = await populateExpense(
    Expense.find({
      employee: { $in: reportIds },
    })
  ).sort({ date: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      teamExpenses.map((e) => attachConvertedAmount(e, companyCurrencyCode)), 
      "Team expenses fetched successfully."
    )
  );
});


export const getReportedExpense = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, `Invalid expense ID format: ${req.params.id}`);
  }
  const managerId = req.user._id;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); 

  let expense = await populateExpense(Expense.findById(req.params.id)).exec();

  if (!expense) {
    throw new ApiError(404, `Expense not found.`);
  } 

  const currentStep = expense.approvalSteps[expense.currentStepIndex];
  const isCurrentApprover =
    currentStep && currentStep.approver.equals(managerId);

  const isTeamManager =
    expense.employee.managerId && expense.employee.managerId.equals(managerId);

  const isAdmin = req.user.role === "admin";

  if (!isCurrentApprover && !isTeamManager && !isAdmin) {
    throw new ApiError(403, "Not authorized to view this expense report.");
  } 

  return res.status(200).json(
    new ApiResponse(
      200,
      attachConvertedAmount(expense, companyCurrencyCode), 
      "Expense report fetched for approval/review."
    )
  );
});


export const approveExpense = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, `Invalid expense ID format: ${req.params.id}`);
  }
  const managerId = req.user._id;
  const { comments } = req.body;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId);

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

  const currentStep = expense.approvalSteps[expense.currentStepIndex]; 

  if (
    !currentStep ||
    !currentStep.approver.equals(managerId) ||
    currentStep.status !== "Pending"
  ) {
    throw new ApiError(
      403,
      "Not authorized or not your turn to approve this expense."
    );
  } 

  currentStep.status = "Approved";
  currentStep.comments = comments || "Approved.";
  currentStep.approvalDate = new Date();

  let finalMessage = "Expense approved. Workflow advanced."; 
  if (checkFinalApprovalRule(expense)) {
    expense.status = ExpenseStatus.APPROVED;
    finalMessage = "Expense APPROVED: Conditional threshold met early.";
    expense.currentStepIndex = expense.approvalSteps.length;
  } else {
    const nextIndex = expense.currentStepIndex + 1;
    const nextStep = expense.approvalSteps[nextIndex];

    if (nextStep) {
      expense.currentStepIndex = nextIndex;
    } else {
      expense.status = ExpenseStatus.REJECTED;
      finalMessage =
        "Expense REJECTED: All sequential steps complete, but conditional rules were not met.";
    }
  } 
  await expense.save({ validateBeforeSave: false }); 

  expense = await populateExpense(Expense.findById(expense._id)).exec();
  return res.status(200).json(
    new ApiResponse(
      200,
      attachConvertedAmount(expense, companyCurrencyCode),
      finalMessage
    )
  );
});


export const rejectExpense = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, `Invalid expense ID format: ${req.params.id}`);
  }
  const managerId = req.user._id;
  const { comments } = req.body;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId);

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

  const currentStep = expense.approvalSteps[expense.currentStepIndex];

  if (
    !currentStep ||
    !currentStep.approver.equals(managerId) ||
    currentStep.status !== "Pending"
  ) {
    throw new ApiError(
      403,
      "Not authorized or not your turn to reject this expense."
    );
  } 

  currentStep.status = "Rejected";
  currentStep.comments = comments || "Rejected.";
  currentStep.approvalDate = new Date();
  expense.status = ExpenseStatus.REJECTED;
  expense.currentStepIndex = expense.approvalSteps.length;

  await expense.save({ validateBeforeSave: false }); 

  expense = await populateExpense(Expense.findById(expense._id)).exec();
  return res.status(200).json(
    new ApiResponse(
      200,
      attachConvertedAmount(expense, companyCurrencyCode), 
      "Expense rejected. Workflow terminated."
    )
  );
});


export const assignWorkflow = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, `Invalid expense ID format: ${req.params.id}`);
  }

  const {
    approvalSteps: customSteps,
    approvalRule,
    managerApprovalRequired,
  } = req.body;
  const companyCurrencyCode = await getCompanyCurrencyCode(req.user.companyId); 

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
  let sequence = 0; 

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
  }
  
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
  } 

  expense.approvalSteps = finalSteps;
  expense.approvalRule = approvalRule;
  expense.currentStepIndex = 0; 
  expense.status = ExpenseStatus.AWAITING_APPROVAL;

  await expense.save();
  expense = await populateExpense(Expense.findById(expense._id)).exec(); 

  return res.status(200).json(
    new ApiResponse(
      200,
      attachConvertedAmount(expense, companyCurrencyCode),
      "Approval workflow successfully assigned and initiated."
    )
  );
});