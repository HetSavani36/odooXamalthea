import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

// --- Configuration ---
dotenv.config();

// Assuming your models and schema status constants are exported from these paths
import Expense, { ExpenseStatus } from "./models/expense.model.js";
import { Company } from "./models/company.model.js";
import { User } from "./models/user.model.js";

// --- MOCK DATA / UTILITIES (to bypass dependencies) ---

// Use a known static password for all seeded users for testing
const STATIC_PASSWORD = "Password123";
const COMPANY_CURRENCY_DATA = { code: "USD", name: "US Dollar", symbol: "$" };

// We no longer need the hashPassword helper since we pass plain text to User.create
// const hashPassword = async (password) => { ... };

// --- CORE SEEDING FUNCTION ---

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB connected for seeding.");

    // 1. CLEAN UP EXISTING DATA
    await Promise.all([
      Company.deleteMany({}),
      User.deleteMany({}),
      Expense.deleteMany({}),
    ]);
    console.log("🗑️ Existing data cleared.");

    // 2. CREATE COMPANY
    const company = await Company.create({
      name: "Global Expense Corp",
      email: "admin@globalexpense.com",
      country: "USA",
      currency: COMPANY_CURRENCY_DATA,
    });

    // 3. CREATE USERS (Roles, Hierarchy, and Currency)
    // PASSING STATIC_PASSWORD DIRECTLY. THE USER MODEL'S pre('save') HOOK WILL HASH IT.

    // ADMIN
    const adminUser = await User.create({
      name: "Alice Admin",
      email: "admin@test.com",
      // PASS PLAIN TEXT: The hook handles the hashing
      password: STATIC_PASSWORD,
      role: "admin",
      companyId: company._id,
      currency: { code: "USD", name: "US Dollar", symbol: "$" },
    });

    // MANAGERS & CFO (Approvers)
    const cfoUser = await User.create({
      name: "Charlie CFO",
      email: "cfo@test.com",
      password: STATIC_PASSWORD,
      role: "manager",
      companyId: company._id,
      currency: { code: "USD", name: "US Dollar", symbol: "$" },
    });

    const managerFinance = await User.create({
      name: "Fin Manager (Bob)",
      email: "manager_fin@test.com",
      password: STATIC_PASSWORD,
      role: "manager",
      companyId: company._id,
      currency: { code: "USD", name: "US Dollar", symbol: "$" },
    });

    const managerDirector = await User.create({
      name: "Director (Diana)",
      email: "manager_dir@test.com",
      password: STATIC_PASSWORD,
      role: "manager",
      companyId: company._id,
      managerId: cfoUser._id, // Reports to CFO
      currency: { code: "USD", name: "US Dollar", symbol: "$" },
    });

    // EMPLOYEES
    const empUS = await User.create({
      name: "Employee US (Sam)",
      email: "employee_us@test.com",
      password: STATIC_PASSWORD,
      role: "employee",
      companyId: company._id,
      managerId: managerDirector._id, // Reports to Director
      currency: { code: "USD", name: "US Dollar", symbol: "$" },
    });

    const empIND = await User.create({
      name: "Employee IND (Priya)",
      email: "employee_ind@test.com",
      password: STATIC_PASSWORD,
      role: "employee",
      companyId: company._id,
      managerId: managerFinance._id, // Reports to Finance Manager
      currency: { code: "INR", name: "Indian Rupee", symbol: "₹" },
    });

    console.log("👤 Users created: Admin, CFO, 2 Managers, 2 Employees.");

    // 4. CREATE EXPENSES (Awaiting Admin Review for Workflow Assignment)

    // Expense 1: Simple Approval (Hybrid Rule)
    const expHybrid = await Expense.create({
      employee: empUS._id,
      description: "Client lunch and travel (Hybrid)",
      date: new Date("2025-10-01"),
      category: "Food",
      paidBy: empUS._id,
      amount: 500.0,
      currency: { code: "USD", name: "US Dollar", symbol: "$" },
      status: ExpenseStatus.AWAITING_ADMIN_REVIEW,
    });

    // Expense 2: Sequential and Percentage Rule
    const expPercentage = await Expense.create({
      employee: empIND._id,
      description: "Software Subscription (INR)",
      date: new Date("2025-09-25"),
      category: "Software",
      paidBy: empIND._id,
      amount: 15000.0,
      currency: { code: "INR", name: "Indian Rupee", symbol: "₹" },
      status: ExpenseStatus.AWAITING_ADMIN_REVIEW,
    });

    console.log(
      `🧾 2 Expenses created in '${ExpenseStatus.AWAITING_ADMIN_REVIEW}' state.`
    );

    // 5. SIMULATE ADMIN WORKFLOW ASSIGNMENT (Using Mongoose direct update to bypass Express)

    // Setup 1: Hybrid Rule (60% OR CFO approval, Sequential: Director, Finance, CFO)
    await Expense.findByIdAndUpdate(expHybrid._id, {
      status: ExpenseStatus.AWAITING_APPROVAL,
      currentStepIndex: 0,
      approvalRule: {
        type: "Hybrid",
        percentage: 60, // 2 out of 3 needed
        specificApprovers: [cfoUser._id], // CFO can auto-approve
        managerApprovalRequired: true, // Manager (Director) is Step 1
      },
      approvalSteps: [
        // Step 1: Manager Director (employee's manager)
        { approver: managerDirector._id, sequence: 0 },
        // Step 2: Finance Manager
        { approver: managerFinance._id, sequence: 1 },
        // Step 3: CFO
        { approver: cfoUser._id, sequence: 2 },
      ],
    });
    console.log(`⚙️ Workflow assigned to Expense ${expHybrid._id} (Hybrid).`);

    // Setup 2: Percentage Rule (100% approval, Sequential: Finance Manager, Director)
    await Expense.findByIdAndUpdate(expPercentage._id, {
      status: ExpenseStatus.AWAITING_APPROVAL,
      currentStepIndex: 0,
      approvalRule: {
        type: "Percentage",
        percentage: 100, // Both needed
        managerApprovalRequired: false,
      },
      approvalSteps: [
        // Step 1: Finance Manager
        { approver: managerFinance._id, sequence: 0 },
        // Step 2: Director
        { approver: managerDirector._id, sequence: 1 },
      ],
    });
    console.log(
      `⚙️ Workflow assigned to Expense ${expPercentage._id} (Percentage).`
    );

    // 6. SIMULATE MANAGER ACTION (Testing sequential approval)
    // Manager Finance approves the first step of Expense 2

    const exp2 = await Expense.findById(expPercentage._id);
    if (
      exp2.approvalSteps[exp2.currentStepIndex].approver.equals(
        managerFinance._id
      )
    ) {
      // Update the current step
      exp2.approvalSteps[exp2.currentStepIndex].status = "Approved";
      exp2.approvalSteps[exp2.currentStepIndex].comments =
        "Approved by Finance.";
      exp2.approvalSteps[exp2.currentStepIndex].approvalDate = new Date();

      // Advance the workflow (Mongoose logic simulated here)
      exp2.currentStepIndex = 1; // Move to Director
      await exp2.save({ validateBeforeSave: false });
      console.log(
        `➡️ Step 1 Approved by Manager Finance. Expense 2 now awaiting Director (${managerDirector.email}).`
      );
    }

    console.log("\n--- Seeding Complete ---");
    console.log(`Test users use password: ${STATIC_PASSWORD}`);
    console.log(
      `Expense 1 (Hybrid) is pending approval by: ${managerDirector.email}`
    );
    console.log(
      `Expense 2 (Percentage) is pending approval by: ${managerDirector.email}`
    );
  } catch (error) {
    console.error("❌ Database Seeding Failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

seedDatabase();
