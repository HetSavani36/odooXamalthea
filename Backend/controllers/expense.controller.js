import Expense, { ExpenseStatus } from "../models/expense.model.js";
import {User} from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"; // Assuming your asyncHandler utility
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const populateExpense = (query) => {
  return query
    .populate("employee", "name email")
    .populate("paidBy", "name email");
};

const getExpenses = asyncHandler(async (req, res, next) => {
  const expenses = await populateExpense(
    Expense.find({ employee: req.user._id }) 
  ).sort({ date: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, expenses, "Expenses fetched successfully."));
});


const getExpense = asyncHandler(async (req, res, next) => {
  const expense = await populateExpense(
    Expense.findOne({
      _id: req.params.id,
      employee: req.user._id,
    })
  );

  if (!expense) {
    throw new ApiError(
      404,
      `Expense not found or you do not have permission to view it.`
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense fetched successfully."));
});


const createExpense = asyncHandler(async (req, res, next) => {
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

  const payerExists = await User.findById(paidBy);
  if (!payerExists) {
    throw new ApiError(
      400,
      `Payer ID '${paidBy}' not found. Please provide a valid user reference.`
    );
  }

  const initialStatus = isSubmitted
    ? ExpenseStatus.SUBMITTED
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
  });

  const createdExpense = await populateExpense(expense);

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdExpense, "Expense successfully created.")
    );
});

const updateExpense = asyncHandler(async (req, res, next) => {
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

  expense = await Expense.findByIdAndUpdate(expense._id, req.body, {
    new: true,
    runValidators: true,
  });

  const updatedExpense = await populateExpense(expense);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedExpense, "Expense successfully updated.")
    );
});

const deleteExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findOne({
    _id: req.params.id,
    employee: req.user._id, // Ensure user owns the expense
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


const submitExpense = asyncHandler(async (req, res, next) => {
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

  expense.status = ExpenseStatus.SUBMITTED;
  await expense.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        expense,
        "Expense successfully submitted for approval."
      )
    );
});

export {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  submitExpense,
};