import { Router } from "express";
import * as reservationController from "../controllers/reservationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const router = Router();

router.post("/", authMiddleware, roleGuard("student"), reservationController.create);
router.get("/my", authMiddleware, roleGuard("student"), reservationController.listMy);
router.get("/stats", authMiddleware, roleGuard("admin", "librarian"), reservationController.stats);
router.get("/book/:bookId/queue", authMiddleware, roleGuard("admin", "librarian"), reservationController.listQueue);
router.delete("/:id", authMiddleware, roleGuard("student"), reservationController.cancel);

export default router;
