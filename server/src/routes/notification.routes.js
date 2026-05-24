import { Router } from "express";
import * as notificationController from "../controllers/notificationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, notificationController.list);
router.get("/unread-count", authMiddleware, notificationController.unreadCount);
router.patch("/:id/read", authMiddleware, notificationController.markRead);
router.patch("/read-all", authMiddleware, notificationController.markAllRead);
router.delete("/:id", authMiddleware, notificationController.remove);

export default router;
