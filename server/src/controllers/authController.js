import * as authService from "../services/authService.js";
import { success, error } from "../utils/responseHelper.js";

export async function register(req, res, next) {
  try {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) return error(res, "full_name, email, and password are required", 400);
    const user = await authService.register(full_name, email, password);
    return success(res, { user }, "Registration successful", 201);
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, "email and password are required", 400);
    const result = await authService.login(email, password);
    return success(res, result, "Login successful");
  } catch (err) { next(err); }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    return success(res, { user });
  } catch (err) { next(err); }
}
