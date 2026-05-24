import { body, validationResult } from "express-validator";
import { error } from "../utils/responseHelper.js";

export const registerValidation = [
  body("full_name").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, "Validation failed", 400, errors.array());
    next();
  },
];

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, "Validation failed", 400, errors.array());
    next();
  },
];
