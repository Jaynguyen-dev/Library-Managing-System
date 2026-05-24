import { Router } from "express";
import * as fineController from "../controllers/fineController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const router = Router();

router.get("/my", authMiddleware, roleGuard("user"), fineController.listMy);
router.get("/revenue", authMiddleware, roleGuard("librarian"), fineController.revenue);
router.get("/", authMiddleware, roleGuard("librarian"), fineController.list);
router.patch("/:id/pay", authMiddleware, roleGuard("librarian"), fineController.pay);
router.patch("/:id/self-pay", authMiddleware, roleGuard("user"), fineController.selfPay);

export default router;
