import { Router } from "express";

import {
  createEmployee,
  createManager,
} from "../controllers/admin.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authorizableRole.js";

const router = Router();
router.use(verifyJWT);
router.use(authorizeRole("admin"))

router.post("/employee", createEmployee);
router.post("/manager", createManager);

export default router;