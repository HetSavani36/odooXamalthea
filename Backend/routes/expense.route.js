import {Router} from "express";
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  submitExpense,
} from "../controllers/expense.controller.js" 
import { verifyJWT } from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authorizableRole.js";

const router = Router();
router.use(verifyJWT)
router.use(authorizeRole("employee"));

router.route("/").get(getExpenses).post(createExpense);
router.route("/:id").get(getExpense).put(updateExpense).delete(deleteExpense);
router.route("/:id/submit").put(submitExpense);

export default router; 