import { error } from "../utils/responseHelper.js";

export function errorHandler(err, req, res, _next) {
  console.error("Unhandled error:", err);
  const message = err.message || "Internal server error";
  const statusCode = err.statusCode || 500;
  return error(res, message, statusCode);
}
