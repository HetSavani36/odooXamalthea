import { Router } from "express";

import {
  createEmployee,
  createManager,
  updateUser,
} from "../controllers/admin.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authorizableRole.js";

const router = Router();
router.use(verifyJWT);
router.use(authorizeRole("admin"))

router.post("/employee", createEmployee);
router.post("/manager", createManager);
router.put("/update/:id",updateUser)

export default router;