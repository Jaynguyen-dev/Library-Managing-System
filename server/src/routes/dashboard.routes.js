import { Router } from "express";
import * as dashboardController from "../controllers/dashboardController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const router = Router();

router.get("/summary", authMiddleware, roleGuard("librarian"), dashboardController.summary);
router.get("/my", authMiddleware, roleGuard("user"), dashboardController.mySummary);

export default router;
