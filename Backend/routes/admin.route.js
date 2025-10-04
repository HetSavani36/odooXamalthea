import { Router } from "express";

import {
  createEmployee,
  createManager,
  updateUser,
  resetPassword,
  getAdminAnalytics
} from "../controllers/admin.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authorizableRole.js";

const router = Router();
router.use(verifyJWT);
router.use(authorizeRole("admin"))

router.get("/analytics",getAdminAnalytics)


router.post("/employee", createEmployee);
router.post("/manager", createManager);
router.put("/update/:id",updateUser)
router.put("/reset-password/:id", resetPassword);

export default router;