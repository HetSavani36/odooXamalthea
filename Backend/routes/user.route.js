import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT)

router.route("/profile").get(getProfile)
router.route("/update-profile").put(updateProfile)
router.route("/change-password").put(changePassword)

export default router;