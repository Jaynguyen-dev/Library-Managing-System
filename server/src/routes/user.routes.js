import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleGuard } from "../middlewares/roleGuard.js";
import { createUserValidation, updateUserValidation } from "../validators/userValidator.js";

const router = Router();

router.get("/", authMiddleware, roleGuard("admin", "librarian"), userController.list);
router.post("/", authMiddleware, roleGuard("admin"), createUserValidation, userController.create);
router.put("/:id", authMiddleware, roleGuard("admin"), updateUserValidation, userController.update);
router.patch("/:id/toggle-active", authMiddleware, roleGuard("admin"), userController.toggleActive);

export default router;
