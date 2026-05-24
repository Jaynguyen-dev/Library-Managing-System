import { PrismaClient } from "@prisma/client";
import { calculateFine } from "../utils/fineCalculator.js";

const prisma = new PrismaClient();

export async function createBorrow(userId, items) {
  if (!items || items.length === 0) throw Object.assign(new Error("At least one book is required"), { statusCode: 400 });
  if (items.length > 3) throw Object.assign(new Error("Maximum 3 books per borrow"), { statusCode: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.is_active) throw Object.assign(new Error("User not found or inactive"), { statusCode: 400 });

  const bookIds = items.map((i) => i.book_id);
  const books = await prisma.book.findMany({ where: { id: { in: bookIds }, is_deleted: false } });

  for (const item of items) {
    const book = books.find((b) => b.id === item.book_id);
    if (!book) throw Object.assign(new Error(`Book id ${item.book_id} not found`), { statusCode: 400 });
    if (book.available_quantity < (item.quantity || 1)) {
      throw Object.assign(new Error(`"${book.title}" is not available`), { statusCode: 400 });
    }
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const borrow = await prisma.borrowRecord.create({
    data: {
      user_id: userId,
      due_date: dueDate,
      status: "active",
      items: {
        create: items.map((i) => ({ book_id: i.book_id, quantity: i.quantity || 1 })),
      },
    },
    include: { items: { include: { book: true } }, user: { select: { id: true, full_name: true, email: true } } },
  });

  for (const item of items) {
    await prisma.book.update({
      where: { id: item.book_id },
      data: { available_quantity: { decrement: item.quantity || 1 } },
    });
  }

  return borrow;
}

export async function listBorrows(status) {
  const where = {};
  if (status) where.status = status;

  return prisma.borrowRecord.findMany({
    where,
    include: {
      user: { select: { id: true, full_name: true, email: true } },
      items: { include: { book: { select: { id: true, title: true, isbn: true } } } },
      fines: true,
    },
    orderBy: { borrow_date: "desc" },
  });
}

export async function listMyBorrows(userId) {
  return prisma.borrowRecord.findMany({
    where: { user_id: userId },
    include: {
      items: { include: { book: { select: { id: true, title: true, isbn: true } } } },
      fines: true,
    },
    orderBy: { borrow_date: "desc" },
  });
}

export async function returnBorrow(borrowId) {
  const borrow = await prisma.borrowRecord.findUnique({
    where: { id: borrowId },
    include: { items: true },
  });

  if (!borrow) throw Object.assign(new Error("Borrow record not found"), { statusCode: 404 });
  if (borrow.status === "returned") throw Object.assign(new Error("Already returned"), { statusCode: 400 });

  const now = new Date();
  let newStatus = "returned";
  let fineAmount = 0;

  if (now > borrow.due_date) {
    newStatus = "returned";
    fineAmount = calculateFine(borrow.due_date, now);
  }

  await prisma.$transaction(async (tx) => {
    await tx.borrowRecord.update({
      where: { id: borrowId },
      data: { status: newStatus, return_date: now },
    });

    for (const item of borrow.items) {
      await tx.book.update({
        where: { id: item.book_id },
        data: { available_quantity: { increment: item.quantity } },
      });
    }

    if (fineAmount > 0) {
      await tx.fine.create({
        data: {
          borrow_record_id: borrowId,
          user_id: borrow.user_id,
          amount: fineAmount,
          reason: "Overdue return",
        },
      });
    }
  });

  return prisma.borrowRecord.findUnique({
    where: { id: borrowId },
    include: {
      user: { select: { id: true, full_name: true, email: true } },
      items: { include: { book: { select: { id: true, title: true, isbn: true } } } },
      fines: true,
    },
  });
}
