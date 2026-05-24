import { body, param, validationResult } from "express-validator";
import { error } from "../utils/responseHelper.js";

export const createUserValidation = [
  body("full_name").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["admin", "librarian", "student"]).withMessage("Role must be admin, librarian, or student"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, "Validation failed", 400, errors.array());
    next();
  },
];

export const updateUserValidation = [
  param("id").isInt().withMessage("Invalid user ID"),
  body("full_name").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("role").optional().isIn(["admin", "librarian", "student"]).withMessage("Role must be admin, librarian, or student"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, "Validation failed", 400, errors.array());
    next();
  },
];
