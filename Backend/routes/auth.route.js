import { Router } from "express";
import {
  refreshController,
  logout,
  meController,
  register,
  login
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authorizableRole.js";

const router = Router();
router.post("/logout",verifyJWT, authorizeRole("employee", "admin", "manager"), logout);
router.post("/refresh-token", refreshController);
router.get(
  "/me",
  verifyJWT,
  authorizeRole("employee", "admin", "manager"),
  meController
);

router.post("/register",register)
router.post("/login",login)

export default router;