import prisma from "../config/db.js";

export async function createNotification(userId, title, message, type = "info", reference = null) {
  return prisma.notification.create({
    data: { user_id: userId, title, message, type, reference },
  });
}

export async function listNotifications(userId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { user_id: userId } }),
  ]);
  return { data, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function markAsRead(notificationId, userId) {
  const n = await prisma.notification.findFirst({ where: { id: notificationId, user_id: userId } });
  if (!n) throw Object.assign(new Error("Notification not found"), { statusCode: 404 });
  return prisma.notification.update({ where: { id: notificationId }, data: { is_read: true } });
}

export async function markAllAsRead(userId) {
  await prisma.notification.updateMany({ where: { user_id: userId, is_read: false }, data: { is_read: true } });
}

export async function getUnreadCount(userId) {
  return prisma.notification.count({ where: { user_id: userId, is_read: false } });
}

export async function deleteNotification(notificationId, userId) {
  const n = await prisma.notification.findFirst({ where: { id: notificationId, user_id: userId } });
  if (!n) throw Object.assign(new Error("Notification not found"), { statusCode: 404 });
  return prisma.notification.delete({ where: { id: notificationId } });
}
