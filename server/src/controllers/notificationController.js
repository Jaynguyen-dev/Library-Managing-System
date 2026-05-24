import * as notificationService from "../services/notificationService.js";
import { success, error } from "../utils/responseHelper.js";

export async function list(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const result = await notificationService.listNotifications(req.user.id, page, limit);
    return success(res, result);
  } catch (err) { next(err); }
}

export async function unreadCount(req, res, next) {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    return success(res, { count });
  } catch (err) { next(err); }
}

export async function markRead(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid notification id", 400);
    const n = await notificationService.markAsRead(id, req.user.id);
    return success(res, { notification: n });
  } catch (err) { next(err); }
}

export async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return success(res, null, "All notifications marked as read");
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid notification id", 400);
    await notificationService.deleteNotification(id, req.user.id);
    return success(res, null, "Notification deleted");
  } catch (err) { next(err); }
}
