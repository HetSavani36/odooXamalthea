import { Router } from "express";
import {
  refreshController,
  logout,
  meController,
  register,
  login,
  verifyOtp,
  resendOtp,
  authenticateController,
  callbackController,
  userRegisterUsingEmail,
  loginUsingEmail,
  adminRegisterUsingEmail,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authorizableRole.js";

const router = Router();

//email + otp
router.post("/register", register);
router.post("/login", login);
router.post("/logout",authorizeRole("user", "admin", "owner"), logout);
router.post("/refresh-token", refreshController);
router.post("/verifyOtp", verifyOtp);
router.post("/resendOtp", resendOtp);
router.get(
  "/me",
  verifyJWT,
  authorizeRole("user", "admin", "owner"),
  meController
);


//google
router.get("/google", authenticateController);
router.get("/google/callback", callbackController);
router.post("/refresh-token", refreshController);
router.post("/logout", logout);
router.get("/me", verifyJWT, meController);

//email
router.post("/register",userRegisterUsingEmail)
router.post("/login",loginUsingEmail)
router.post("/admin/register",adminRegisterUsingEmail)


export default router;
