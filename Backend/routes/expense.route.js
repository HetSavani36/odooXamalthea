import {Router} from "express";
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  submitExpense,

  getPendingApprovals,
  getTeamExpenses,
  getReportedExpense,
  approveExpense,
  rejectExpense,
  
  assignWorkflow,
} from "../controllers/expense.controller.js"; 

import { verifyJWT } from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authorizableRole.js";

const router = Router();
router.use(verifyJWT)

router.route("/expenses").get(authorizeRole("employee"),getExpenses).post(authorizeRole("employee"),createExpense);

router
  .route("/expenses/:id")
  .get(authorizeRole("employee"),getExpense)
  .put(authorizeRole("employee"),updateExpense)
  .delete(authorizeRole("employee"),deleteExpense);

router.route("/expenses/:id/submit").put(submitExpense);

router.route("/approvals/pending").get(authorizeRole("manager"),getPendingApprovals);
router.route("/approvals/team").get(authorizeRole("manager"), getTeamExpenses);
router.route("/approvals/:id").get(authorizeRole("manager"), getReportedExpense);

router.route("/approvals/:id/approve").put(authorizeRole("manager"),approveExpense);
router.route("/approvals/:id/reject").put(authorizeRole("manager"),rejectExpense);

router.route("/admin/expenses/:id/assign-workflow").post(authorizeRole("admin"),assignWorkflow);

export default router;