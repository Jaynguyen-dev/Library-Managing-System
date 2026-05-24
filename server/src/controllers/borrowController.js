import * as borrowService from "../services/borrowService.js";
import { success, error } from "../utils/responseHelper.js";

export async function create(req, res, next) {
  try {
    const { user_id, items } = req.body;
    if (!user_id) return error(res, "user_id is required", 400);
    const borrow = await borrowService.createBorrow(user_id, items);
    return success(res, { borrow }, "Borrow record created", 201);
  } catch (err) { next(err); }
}

export async function selfBorrow(req, res, next) {
  try {
    const { book_id } = req.body;
    if (!book_id) return error(res, "book_id is required", 400);
    const borrow = await borrowService.createBorrow(req.user.id, [{ book_id, quantity: 1 }]);
    return success(res, { borrow }, "Book borrowed successfully", 201);
  } catch (err) { next(err); }
}

export async function list(req, res, next) {
  try {
    const status = req.query.status || "";
    const page = req.query.page;
    const limit = req.query.limit;
    const result = await borrowService.listBorrows(status, page, limit);
    return success(res, { borrows: result.data, pagination: { total: result.total, page: result.page, limit: result.limit, pages: result.pages } });
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid borrow id", 400);
    const borrow = await borrowService.getBorrowById(id);
    if (req.user.role === "user" && borrow.user_id !== req.user.id) {
      return error(res, "Forbidden", 403);
    }
    return success(res, { borrow });
  } catch (err) { next(err); }
}

export async function listMy(req, res, next) {
  try {
    const status = req.query.status || "";
    const borrows = await borrowService.listMyBorrows(req.user.id, status);
    return success(res, { borrows });
  } catch (err) { next(err); }
}

export async function requestReturn(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid borrow id", 400);
    const borrow = await borrowService.requestReturn(id, req.user.id);
    return success(res, { borrow }, "Return requested", 200);
  } catch (err) { next(err); }
}

export async function confirmReturn(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid borrow id", 400);
    const borrow = await borrowService.confirmReturn(id, req.user.id);
    return success(res, { borrow }, "Return confirmed", 200);
  } catch (err) { next(err); }
}
