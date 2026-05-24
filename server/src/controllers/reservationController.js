import * as reservationService from "../services/reservationService.js";
import { success, error } from "../utils/responseHelper.js";

export async function create(req, res, next) {
  try {
    const { book_id } = req.body;
    if (!book_id) return error(res, "book_id is required", 400);
    const reservation = await reservationService.createReservation(req.user.id, book_id);
    return success(res, { reservation }, "Book reserved successfully", 201);
  } catch (err) { next(err); }
}

export async function listMy(req, res, next) {
  try {
    const reservations = await reservationService.getMyReservations(req.user.id);
    return success(res, { reservations });
  } catch (err) { next(err); }
}

export async function listQueue(req, res, next) {
  try {
    const bookId = parseInt(req.params.bookId, 10);
    if (isNaN(bookId)) return error(res, "Invalid book id", 400);
    const queue = await reservationService.getQueueForBook(bookId);
    return success(res, { queue });
  } catch (err) { next(err); }
}

export async function cancel(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid reservation id", 400);
    const result = await reservationService.cancelReservation(id, req.user.id);
    return success(res, { reservation: result }, "Reservation cancelled");
  } catch (err) { next(err); }
}

export async function stats(req, res, next) {
  try {
    const data = await reservationService.getReservationStats();
    return success(res, data);
  } catch (err) { next(err); }
}
