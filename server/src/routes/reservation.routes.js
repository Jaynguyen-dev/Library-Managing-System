import { Router } from "express";
import * as reservationController from "../controllers/reservationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const router = Router();

router.post("/", authMiddleware, roleGuard("user"), reservationController.create);
router.get("/my", authMiddleware, roleGuard("user"), reservationController.listMy);
router.get("/stats", authMiddleware, roleGuard("librarian"), reservationController.stats);
router.get("/book/:bookId/queue", authMiddleware, roleGuard("librarian"), reservationController.listQueue);
router.delete("/:id", authMiddleware, roleGuard("user"), reservationController.cancel);

export default router;
