import * as userService from "../services/userService.js";
import { success, error } from "../utils/responseHelper.js";

export async function list(req, res, next) {
  try {
    const role = req.query.role || "";
    const users = await userService.listUsers(role);
    return success(res, { users });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const { full_name, email, password, role } = req.body;
    if (!full_name || !email || !password) return error(res, "full_name, email, and password are required", 400);
    const user = await userService.createUser({ full_name, email, password, role });
    return success(res, { user }, "User created", 201);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid user id", 400);
    const user = await userService.updateUser(id, req.body);
    return success(res, { user }, "User updated");
  } catch (err) { next(err); }
}

export async function toggleActive(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid user id", 400);
    const user = await userService.toggleActive(id);
    return success(res, { user }, "User status toggled");
  } catch (err) { next(err); }
}
