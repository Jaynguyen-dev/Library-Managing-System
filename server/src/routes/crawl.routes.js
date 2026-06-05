import { Router } from "express";
import * as crawlController from "../controllers/crawlController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const router = Router();

router.post("/isbn/:isbn", authMiddleware, roleGuard("librarian"), crawlController.enrichByIsbn);
router.post("/batch", authMiddleware, roleGuard("librarian"), crawlController.batchEnrich);


export default router;
