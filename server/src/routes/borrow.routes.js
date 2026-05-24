import { Router } from "express";
import * as borrowController from "../controllers/borrowController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const router = Router();

router.post("/", authMiddleware, roleGuard("admin", "librarian"), borrowController.create);
router.get("/", authMiddleware, roleGuard("admin", "librarian"), borrowController.list);
router.get("/my", authMiddleware, roleGuard("student"), borrowController.listMy);
router.patch("/:id/return", authMiddleware, roleGuard("admin", "librarian"), borrowController.returnBorrow);

export default router;
