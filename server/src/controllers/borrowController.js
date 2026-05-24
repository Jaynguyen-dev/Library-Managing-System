import * as borrowService from "../services/borrowService.js";
import { success, error } from "../utils/responseHelper.js";

export async function create(req, res, next) {
  try {
    const { user_id, items } = req.body;
    if (!user_id || !items) return error(res, "user_id and items are required", 400);
    const borrow = await borrowService.createBorrow(user_id, items);
    return success(res, { borrow }, "Borrow record created", 201);
  } catch (err) { next(err); }
}

export async function list(req, res, next) {
  try {
    const status = req.query.status || "";
    const borrows = await borrowService.listBorrows(status);
    return success(res, { borrows });
  } catch (err) { next(err); }
}

export async function listMy(req, res, next) {
  try {
    const borrows = await borrowService.listMyBorrows(req.user.id);
    return success(res, { borrows });
  } catch (err) { next(err); }
}

export async function returnBorrow(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid borrow id", 400);
    const borrow = await borrowService.returnBorrow(id);
    return success(res, { borrow }, "Book returned");
  } catch (err) { next(err); }
}
