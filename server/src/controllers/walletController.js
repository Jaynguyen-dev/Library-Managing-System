import * as walletService from "../services/walletService.js";
import { success, error } from "../utils/responseHelper.js";

export async function get(req, res, next) {
  try {
    const wallet = await walletService.getWallet(req.user.id);
    return success(res, { wallet });
  } catch (err) { next(err); }
}

export async function addCredits(req, res, next) {
  try {
    const { amount, payment_method } = req.body;
    if (!amount || !payment_method) return error(res, "amount and payment_method are required", 400);
    const wallet = await walletService.addCredits(req.user.id, parseInt(amount, 10), payment_method);
    return success(res, { wallet }, "Credits added successfully");
  } catch (err) { next(err); }
}

export async function transactions(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await walletService.getTransactions(req.user.id, page, limit);
    return success(res, result);
  } catch (err) { next(err); }
}
