import * as crawlService from "../services/crawlService.js";
import { success, error } from "../utils/responseHelper.js";

export async function enrichByIsbn(req, res, next) {
  try {
    const { isbn } = req.params;
    if (!isbn) return error(res, "ISBN parameter is required", 400);
    const result = await crawlService.enrichByIsbn(isbn);
    return success(res, result, "Crawl completed");
  } catch (err) { next(err); }
}

export async function batchEnrich(req, res, next) {
  try {
    const result = await crawlService.batchEnrich();
    return success(res, result, "Batch crawl completed");
  } catch (err) { next(err); }
}


