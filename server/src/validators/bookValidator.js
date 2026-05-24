import { body, param, validationResult } from "express-validator";
import { error } from "../utils/responseHelper.js";

const isbnPattern = /^(?:\d{10}|\d{13}|\d{3}-\d{1,5}-\d{1,7}-\d{1,7}-[\dX])$/;

export const createBookValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("author").trim().notEmpty().withMessage("Author is required"),
  body("isbn").trim().notEmpty().withMessage("ISBN is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("total_quantity").isInt({ min: 1 }).withMessage("Total quantity must be at least 1"),
  body("description").optional().trim(),
  body("published_year").optional().isInt({ min: 1000, max: 2100 }).withMessage("Invalid published year"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, "Validation failed", 400, errors.array());
    next();
  },
];

export const updateBookValidation = [
  param("id").isInt().withMessage("Invalid book ID"),
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("author").optional().trim().notEmpty().withMessage("Author cannot be empty"),
  body("isbn").optional().trim().notEmpty().withMessage("ISBN cannot be empty"),
  body("category").optional().trim().notEmpty().withMessage("Category cannot be empty"),
  body("total_quantity").optional().isInt({ min: 1 }).withMessage("Total quantity must be at least 1"),
  body("description").optional().trim(),
  body("published_year").optional().isInt({ min: 1000, max: 2100 }).withMessage("Invalid published year"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, "Validation failed", 400, errors.array());
    next();
  },
];
