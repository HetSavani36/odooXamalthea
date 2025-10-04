import { Router } from "express";
import { getEmployeeAnalytics} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authorizableRole.js";

const router = Router();
router.use(verifyJWT)

router.get("/employee", authorizeRole("employee"), getEmployeeAnalytics);

export default router;