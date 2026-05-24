import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { registerValidation, loginValidation } from "../validators/authValidator.js";

const router = Router();

router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.get("/me", authMiddleware, authController.getMe);

export default router;
