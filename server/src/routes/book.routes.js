import { Router } from "express";
import * as bookController from "../controllers/bookController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleGuard } from "../middlewares/roleGuard.js";
import { createBookValidation, updateBookValidation } from "../validators/bookValidator.js";

const router = Router();

router.get("/", authMiddleware, bookController.list);
router.get("/:id", authMiddleware, bookController.getById);
router.post("/", authMiddleware, roleGuard("admin", "librarian"), createBookValidation, bookController.create);
router.put("/:id", authMiddleware, roleGuard("admin", "librarian"), updateBookValidation, bookController.update);
router.delete("/:id", authMiddleware, roleGuard("admin", "librarian"), bookController.remove);

export default router;
