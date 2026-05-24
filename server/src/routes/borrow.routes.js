import { Router } from "express";
import * as borrowController from "../controllers/borrowController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleGuard } from "../middlewares/roleGuard.js";
import { createBorrowValidation } from "../validators/borrowValidator.js";

const router = Router();

router.post("/", authMiddleware, roleGuard("admin", "librarian"), createBorrowValidation, borrowController.create);
router.post("/self", authMiddleware, borrowController.selfBorrow);
router.get("/my", authMiddleware, roleGuard("student"), borrowController.listMy);
router.get("/", authMiddleware, roleGuard("admin", "librarian"), borrowController.list);
router.get("/:id", authMiddleware, borrowController.getById);
router.post("/:id/request-return", authMiddleware, borrowController.requestReturn);
router.patch("/:id/confirm-return", authMiddleware, roleGuard("admin", "librarian"), borrowController.confirmReturn);

export default router;
