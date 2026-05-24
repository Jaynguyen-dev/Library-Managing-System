import { Router } from "express";
import * as crawlController from "../controllers/crawlController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const router = Router();

router.post("/isbn/:isbn", authMiddleware, roleGuard("admin"), crawlController.enrichByIsbn);
router.post("/batch", authMiddleware, roleGuard("admin"), crawlController.batchEnrich);
router.get("/logs", authMiddleware, roleGuard("admin"), crawlController.getLogs);
router.delete("/logs", authMiddleware, roleGuard("admin"), crawlController.deleteLogs);

export default router;
