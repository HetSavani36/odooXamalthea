import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getCurrencyByCountry } from "../utils/currencyHelper.js";
import { sendEmail } from "../utils/email.js";

function generatePassword(length = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

const createEmployee = asyncHandler(async (req, res) => {
  const { name, email, country, managerId } = req.body;
  if (!name || !email || !country)
    throw new ApiError(403, "provide all fields");

  const currency = await getCurrencyByCountry(country);
  if (!currency) throw new ApiError(400, "incorrect country");

  const manager = await User.findById(managerId);
  if (!manager || manager.role != "manager")
    throw new ApiError(404, "manager not found");

  const password=generatePassword(7)

  const existingUser=await User.findOne({email:email})
  if(existingUser) throw new ApiError(403,"user already found")

  let user = await User.create({
    name: name,
    email: email,
    password: password,
    role: "employee",
    companyId: req.user.companyId,
    managerId: managerId,
    currency: {
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
    },
  });
  if (!user) throw new ApiError(500, "user creation failed");

  const emailText = `
      Hello Employee,

      Your employee account has been created successfully.

      Email: ${email}
      Password: ${password}

      Please login and change your password immediately.
    `;
  await sendEmail(email, "Your Employee Account Password", emailText, null);

  res.json(
    new ApiResponse(201,{},"new employee created")
  )
});


const createManager = asyncHandler(async (req, res) => {
  const { name, email, country } = req.body;
  if (!name || !email || !country)
    throw new ApiError(403, "provide all fields");

    const existingUser = await User.findOne({ email: email });
    if (existingUser) throw new ApiError(403, "user already found");

    const currency = await getCurrencyByCountry(country);
    if (!currency) throw new ApiError(400, "incorrect country");

    const password = generatePassword(7);

    let user = await User.create({
        name: name,
        email: email,
        password: password,
        role: "manager",
        companyId: req.user.companyId,
        managerId: req.user._id,
        currency: {
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol,
        },
    });
    if (!user) throw new ApiError(500, "user creation failed");

    const emailText = `
        Hello Manager,

        Your manager account has been created successfully.

        Email: ${email}
        Password: ${password}

        Please login and change your password immediately.
        `;
    await sendEmail(email, "Your Manager Account Password", emailText, null);

    res.json(new ApiResponse(201, {}, "new manager created"));
});

const resetPassword=asyncHandler(async(req,res)=>{
    const id = req.params.id;
    const existingUser = await User.findById(id);
    if (!existingUser) throw new ApiError(404, "no user found");

    const password=generatePassword(7)
    existingUser.password=password
    await existingUser.save({validateBeforeSave:false})

    
    const emailText = `
        Hello ${existingUser.role},

        Your new resetted password has been created successfully.

        Email: ${existingUser.email}
        Password: ${password}

        Please login and change your password immediately.
        `;
    await sendEmail(email, "Your Reset Password", emailText, null);

    res.json(new ApiResponse(200, {}, "password reset successfully"));
})

const updateUser=asyncHandler(async(req,res)=>{
    const id=req.params.id
    const { name, email, role, managerId, country } = req.body;

    const existingUser = await User.findById(id);
    if (!existingUser) throw new ApiError(404, "no user found");

    if(country){
      const currency = await getCurrencyByCountry(country);
      if (!currency) throw new ApiError(400, "incorrect country");
      existingUser.currency= {
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol,
      }
    }
    if (name) existingUser.name = name;
    if (email) existingUser.email = email;
    if (role) existingUser.role = role;
    if (managerId) existingUser.managerId = managerId;

    await existingUser.save({validateBeforeSave:false})
    res.json(
      new ApiResponse(200,{},"user updated successfully")
    )
})

const getAdminAnalytics = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId; 
  
  const users = await User.find({
    companyId: companyId,
    $or: [{ role: "employee" }, { role: "manager" }],
  }).select("-password -refreshToken");

  const totalUsersCount = await User.countDocuments({ companyId: companyId });
  const adminCount = await User.countDocuments({
    companyId: companyId,
    role: "admin",
  });
  const managerCount = await User.countDocuments({
    companyId: companyId,
    role: "manager",
  });
  const employeeCount = await User.countDocuments({
    companyId: companyId,
    role: "employee",
  }); 

  const companyCurrencyCode = await getCompanyCurrencyCode(companyId); // a. Pending Approvals Count

  const pendingApprovalsCount = await Expense.countDocuments({
    status: {
      $in: [
        ExpenseStatus.AWAITING_ADMIN_REVIEW,
        ExpenseStatus.AWAITING_APPROVAL,
      ],
    },
  }); 
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyTotalPipeline = [
    {
      $match: { 
        createdAt: { $gte: startOfMonth },
        status: {
          $in: [ExpenseStatus.APPROVED, ExpenseStatus.AWAITING_APPROVAL],
        },
      },
    },
    {
      $group: {
        _id: "$currency.code",
        totalAmount: { $sum: "$amount" },
      },
    },
  ];
  const monthlyTotalsByCurrency = await Expense.aggregate(monthlyTotalPipeline);

  let monthlyExpenseTotal = 0;
  for (const item of monthlyTotalsByCurrency) {
    const converted = currencyConverter(
      item.totalAmount,
      item._id,
      companyCurrencyCode
    );
    monthlyExpenseTotal += converted;
  } 

  const distinctRules = await Expense.aggregate([
    {
      $match: {
        status: {
          $in: [
            ExpenseStatus.AWAITING_APPROVAL,
            ExpenseStatus.AWAITING_ADMIN_REVIEW,
          ],
        },
      },
    },
    { $group: { _id: "$approvalRule.type" } }, 
  ]);
  const activeApprovalRules = distinctRules.map((doc) => doc._id);

  res.json(
    new ApiResponse(
      200,
      {
        users, 
        totalUsersCount,
        adminCount,
        managerCount,
        employeeCount, 
        pendingApprovalsCount,
        monthlyExpenseTotal: {
          amount: monthlyExpenseTotal,
          currency: companyCurrencyCode,
        },
        activeApprovalRules,
      },
      "Admin analytics data fetched."
    )
  );
});

export {
  createEmployee,
  createManager,
  updateUser,
  resetPassword,
  getAdminAnalytics,
};