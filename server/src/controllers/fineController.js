import * as fineService from "../services/fineService.js";
import { success, error } from "../utils/responseHelper.js";

export async function list(req, res, next) {
  try {
    const isPaid = req.query.is_paid;
    const page = req.query.page;
    const limit = req.query.limit;
    const result = await fineService.listFines(isPaid, page, limit);
    return success(res, { fines: result.data, pagination: { total: result.total, page: result.page, limit: result.limit, pages: result.pages } });
  } catch (err) { next(err); }
}

export async function listMy(req, res, next) {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const result = await fineService.listMyFines(req.user.id, page, limit);
    return success(res, { fines: result.data, pagination: { total: result.total, page: result.page, limit: result.limit, pages: result.pages } });
  } catch (err) { next(err); }
}

export async function pay(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid fine id", 400);
    const fine = await fineService.payFine(id, req.user.id);
    return success(res, { fine }, "Fine marked as paid");
  } catch (err) { next(err); }
}

export async function selfPay(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid fine id", 400);
    const fine = await fineService.selfPayFine(id, req.user.id);
    return success(res, { fine }, "Fine paid from wallet");
  } catch (err) { next(err); }
}

export async function revenue(req, res, next) {
  try {
    const summary = await fineService.getRevenueSummary();
    return success(res, summary);
  } catch (err) { next(err); }
}
