import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const router = Router();

router.get("/", authMiddleware, roleGuard("admin"), userController.list);
router.post("/", authMiddleware, roleGuard("admin"), userController.create);
router.put("/:id", authMiddleware, roleGuard("admin"), userController.update);
router.patch("/:id/toggle-active", authMiddleware, roleGuard("admin"), userController.toggleActive);

export default router;
