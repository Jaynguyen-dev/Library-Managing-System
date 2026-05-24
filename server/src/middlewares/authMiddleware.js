import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { error } from "../utils/responseHelper.js";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return error(res, "No token provided", 401);
  }
  try {
    req.user = jwt.verify(header.split(" ")[1], ENV.JWT_SECRET);
    next();
  } catch {
    return error(res, "Invalid token", 401);
  }
}
