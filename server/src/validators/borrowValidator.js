import { body, param, validationResult } from "express-validator";
import { error } from "../utils/responseHelper.js";

export const createBorrowValidation = [
  body("user_id").isInt({ min: 1 }).withMessage("Valid user_id is required"),
  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
  body("items.*.book_id").isInt({ min: 1 }).withMessage("Valid book_id is required"),
  body("items.*.quantity").isInt({ min: 1, max: 3 }).withMessage("Quantity must be between 1 and 3"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, "Validation failed", 400, errors.array());
    next();
  },
];

export const returnBorrowValidation = [
  param("id").isInt().withMessage("Invalid borrow ID"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, "Validation failed", 400, errors.array());
    next();
  },
];
