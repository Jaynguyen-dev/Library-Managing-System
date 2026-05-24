import * as fineService from "../services/fineService.js";
import { success, error } from "../utils/responseHelper.js";

export async function list(req, res, next) {
  try {
    const isPaid = req.query.is_paid;
    const fines = await fineService.listFines(isPaid);
    return success(res, { fines });
  } catch (err) { next(err); }
}

export async function pay(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid fine id", 400);
    const fine = await fineService.payFine(id);
    return success(res, { fine }, "Fine marked as paid");
  } catch (err) { next(err); }
}
