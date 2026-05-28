import prisma from "../config/db.js";
import * as notificationService from "./notificationService.js";

const RESERVATION_WINDOW_HOURS = 48;

function calcQueuePosition(waitingCount) {
  return waitingCount + 1;
}

export async function createReservation(userId, bookId) {
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book || book.is_deleted) throw Object.assign(new Error("Book not found"), { statusCode: 404 });
  if (book.available_quantity > 0) throw Object.assign(new Error("Book is currently available — you can borrow it directly"), { statusCode: 400 });

  const existing = await prisma.reservation.findFirst({
    where: { user_id: userId, book_id: bookId, status: { in: ["waiting", "notified"] } },
  });
  if (existing) throw Object.assign(new Error("You already have an active reservation for this book"), { statusCode: 400 });

  const waitingCount = await prisma.reservation.count({
    where: { book_id: bookId, status: { in: ["waiting", "notified"] } },
  });

  const reservation = await prisma.reservation.create({
    data: {
      user_id: userId,
      book_id: bookId,
      status: "waiting",
      queue_position: waitingCount + 1,
    },
    include: {
      book: { select: { id: true, title: true, author: true, isbn: true, metadata: { select: { cover_image_url: true } } } },
    },
  });

  await notificationService.createNotification(
    userId,
    "Book Reserved",
    `You've reserved "${book.title}". You'll be notified when it becomes available. Your position: #${waitingCount + 1}`,
    "info",
    `reservation_${reservation.id}`,
  );

  return reservation;
}

export async function getMyReservations(userId) {
  const reservations = await prisma.reservation.findMany({
    where: { user_id: userId },
    include: {
      book: { select: { id: true, title: true, author: true, isbn: true, available_quantity: true, total_quantity: true, metadata: { select: { cover_image_url: true } } } },
    },
    orderBy: { reserved_at: "desc" },
  });

  const enriched = await Promise.all(reservations.map(async (r) => {
    if (r.status === "waiting") {
      const earlierCount = await prisma.reservation.count({
        where: { book_id: r.book_id, status: { in: ["waiting", "notified"] }, reserved_at: { lt: r.reserved_at } },
      });
      return { ...r, queue_position: earlierCount + 1 };
    }
    return r;
  }));

  return enriched;
}

export async function getQueueForBook(bookId) {
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book || book.is_deleted) throw Object.assign(new Error("Book not found"), { statusCode: 404 });

  const reservations = await prisma.reservation.findMany({
    where: { book_id: bookId, status: { in: ["waiting", "notified"] } },
    include: {
      user: { select: { id: true, full_name: true, email: true } },
    },
    orderBy: { reserved_at: "asc" },
  });

  return reservations.map((r, i) => ({ ...r, queue_position: i + 1 }));
}

export async function cancelReservation(reservationId, userId) {
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) throw Object.assign(new Error("Reservation not found"), { statusCode: 404 });
  if (reservation.user_id !== userId) throw Object.assign(new Error("Forbidden"), { statusCode: 403 });
  if (!["waiting", "notified"].includes(reservation.status)) throw Object.assign(new Error("Cannot cancel this reservation"), { statusCode: 400 });

  const wasNotified = reservation.status === "notified";

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "cancelled", cancelled_at: new Date() },
  });

  if (wasNotified) {
    await clearBookReservationLock(reservation.book_id);
  }

  return { id: reservationId, status: "cancelled" };
}

async function clearBookReservationLock(bookId) {
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) return;

  if (book.reserved_for_user_id) {
    await prisma.book.update({
      where: { id: bookId },
      data: { reserved_for_user_id: null, reservation_expires_at: null },
    });
  }

  const nextWaiting = await prisma.reservation.findFirst({
    where: { book_id: bookId, status: "waiting" },
    orderBy: { reserved_at: "asc" },
  });

  if (nextWaiting) {
    await promoteToNotified(nextWaiting.id, bookId);
  }
}

async function promoteToNotified(reservationId, bookId) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESERVATION_WINDOW_HOURS * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.update({
      where: { id: reservationId },
      data: { status: "notified", notified_at: now, expires_at: expiresAt },
      include: { book: { select: { title: true } }, user: { select: { id: true, full_name: true } } },
    });

    await tx.book.update({
      where: { id: bookId },
      data: { reserved_for_user_id: reservation.user_id, reservation_expires_at: expiresAt },
    });

    await notificationService.createNotification(
      reservation.user_id,
      "Book Available",
      `"${reservation.book.title}" is now available. You reserved this book earlier. Please borrow it within the next ${RESERVATION_WINDOW_HOURS} hours before the reservation expires.`,
      "info",
      `reservation_${reservation.id}`,
    );
  });
}

export async function processReturnAndPromoteQueue(bookId, tx) {
  const book = await tx.book.findUnique({
    where: { id: bookId },
    select: { title: true },
  });

  const nextWaiting = await tx.reservation.findFirst({
    where: { book_id: bookId, status: "waiting" },
    orderBy: { reserved_at: "asc" },
    include: { user: { select: { id: true, full_name: true } } },
  });

  if (nextWaiting) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + RESERVATION_WINDOW_HOURS * 60 * 60 * 1000);

    await tx.reservation.update({
      where: { id: nextWaiting.id },
      data: { status: "notified", notified_at: now, expires_at: expiresAt },
    });

    await tx.book.update({
      where: { id: bookId },
      data: { reserved_for_user_id: nextWaiting.user_id, reservation_expires_at: expiresAt },
    });

    await notificationService.createNotification(
      nextWaiting.user_id,
      "Book Available",
      `"${book?.title || "A reserved book"}" is now available. You reserved this book earlier. Please borrow it within the next ${RESERVATION_WINDOW_HOURS} hours before the reservation expires.`,
      "info",
      `reservation_${nextWaiting.id}`,
    );
  }
}

export async function processExpiredReservations() {
  const now = new Date();
  const expired = await prisma.reservation.findMany({
    where: { status: "notified", expires_at: { lt: now } },
    include: { book: { select: { id: true, title: true } }, user: { select: { id: true, full_name: true } } },
  });

  for (const reservation of expired) {
    await prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: "expired" },
      });

      await notificationService.createNotification(
        reservation.user_id,
        "Reservation Expired",
        `Your reservation for "${reservation.book.title}" has expired. The book is now available for the next person in line.`,
        "info",
        `reservation_${reservation.id}`,
      );
    });

    await clearBookReservationLock(reservation.book_id);
  }

  if (expired.length > 0) {
    console.log(`[Scheduler] Expired ${expired.length} reservation(s) and promoted queue`);
  }

  return expired.length;
}

export async function getActiveReservationForUser(userId, bookId) {
  return prisma.reservation.findFirst({
    where: { user_id: userId, book_id: bookId, status: { in: ["waiting", "notified"] } },
  });
}

export async function getReservationStats() {
  const now = new Date();
  const [totalWaiting, totalNotified, reservedBooksCount] = await Promise.all([
    prisma.reservation.count({ where: { status: "waiting" } }),
    prisma.reservation.count({ where: { status: "notified" } }),
    prisma.book.count({ where: { reserved_for_user_id: { not: null } } }),
  ]);
  return { totalWaiting, totalNotified, reservedBooksCount };
}
