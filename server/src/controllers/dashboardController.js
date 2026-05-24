import * as dashboardService from "../services/dashboardService.js";
import { success } from "../utils/responseHelper.js";

export async function summary(req, res, next) {
  try {
    const data = await dashboardService.getSummary();
    return success(res, data);
  } catch (err) { next(err); }
}

export async function mySummary(req, res, next) {
  try {
    const data = await dashboardService.getMySummary(req.user.id);
    return success(res, data);
  } catch (err) { next(err); }
}
