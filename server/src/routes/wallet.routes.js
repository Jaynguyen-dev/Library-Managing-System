import { Router } from "express";
import * as walletController from "../controllers/walletController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const router = Router();

router.get("/", authMiddleware, roleGuard("student"), walletController.get);
router.post("/add", authMiddleware, roleGuard("student"), walletController.addCredits);
router.get("/transactions", authMiddleware, roleGuard("student"), walletController.transactions);

export default router;
