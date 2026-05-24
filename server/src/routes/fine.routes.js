import { Router } from "express";
import * as fineController from "../controllers/fineController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const router = Router();

router.get("/", authMiddleware, roleGuard("admin", "librarian"), fineController.list);
router.patch("/:id/pay", authMiddleware, roleGuard("admin", "librarian"), fineController.pay);

export default router;
