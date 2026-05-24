import { Router } from "express";
import * as fineController from "../controllers/fineController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const router = Router();

router.get("/my", authMiddleware, roleGuard("student"), fineController.listMy);
router.get("/revenue", authMiddleware, roleGuard("admin"), fineController.revenue);
router.get("/", authMiddleware, roleGuard("admin", "librarian"), fineController.list);
router.patch("/:id/pay", authMiddleware, roleGuard("admin"), fineController.pay);
router.patch("/:id/self-pay", authMiddleware, roleGuard("student"), fineController.selfPay);

export default router;
