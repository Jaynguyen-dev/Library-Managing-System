import prisma from "../config/db.js";
import { paginate } from "../utils/paginate.js";
import { FINE_PER_DAY } from "../utils/fineCalculator.js";
import * as walletService from "./walletService.js";

export async function listFines(isPaid, page, limit) {
  const where = {};
  if (isPaid !== undefined) where.is_paid = isPaid === "true" || isPaid === true;

  const result = await paginate(prisma.fine, {
    where,
    include: {
      borrow_record: {
        select: {
          id: true,
          borrow_date: true,
          due_date: true,
          items: {
            select: {
              book: {
                select: {
                  id: true,
                  title: true,
                  isbn: true,
                  metadata: {
                    select: { cover_image_url: true },
                  },
                },
              },
            },
          },
        },
      },
      user: { select: { id: true, full_name: true, email: true } },
    },
    orderBy: { created_at: "desc" },
  }, page, limit);

  return { ...result, data: result.data.map(recalculateFine) };
}

function recalculateFine(fine) {
  if (!fine || fine.is_paid || !fine.borrow_record) return fine;
  const now = new Date();
  const due = new Date(fine.borrow_record.due_date);
  if (now <= due) return fine;
  const overdueDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
  const calculatedAmount = overdueDays * FINE_PER_DAY;
  if (calculatedAmount !== fine.amount) {
    prisma.fine.update({ where: { id: fine.id }, data: { amount: calculatedAmount, overdue_days: overdueDays } }).catch(() => {});
    return { ...fine, amount: calculatedAmount, overdue_days: overdueDays };
  }
  return fine;
}

export async function listMyFines(userId, page, limit) {
  const result = await paginate(prisma.fine, {
    where: { user_id: userId },
    include: {
      borrow_record: {
        select: {
          id: true,
          borrow_date: true,
          due_date: true,
          items: {
            select: {
              book: {
                select: {
                  id: true,
                  title: true,
                  isbn: true,
                  metadata: {
                    select: { cover_image_url: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  }, page, limit);

  return { ...result, data: result.data.map(recalculateFine) };
}

export async function selfPayFine(fineId, userId) {
  const fine = await prisma.fine.findUnique({ where: { id: fineId } });
  if (!fine) throw Object.assign(new Error("Fine not found"), { statusCode: 404 });
  if (fine.is_paid) throw Object.assign(new Error("Fine already paid"), { statusCode: 400 });
  if (fine.user_id !== userId) throw Object.assign(new Error("Forbidden"), { statusCode: 403 });

  await walletService.deductFromWallet(
    userId,
    fine.amount,
    `fine_${fine.id}`,
    "Fine payment",
  );

  return prisma.fine.update({
    where: { id: fineId },
    data: { is_paid: true, paid_at: new Date(), paid_by: userId, payment_method: "wallet" },
    include: {
      borrow_record: {
        select: {
          id: true,
          borrow_date: true,
          due_date: true,
          items: {
            select: {
              book: {
                select: {
                  id: true,
                  title: true,
                  isbn: true,
                  metadata: {
                    select: { cover_image_url: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getRevenueSummary() {
  const [totalRevenue, paidRevenue, unpaidRevenue, paidCount, unpaidCount] = await Promise.all([
    prisma.fine.aggregate({ _sum: { amount: true } }),
    prisma.fine.aggregate({ where: { is_paid: true }, _sum: { amount: true } }),
    prisma.fine.aggregate({ where: { is_paid: false }, _sum: { amount: true } }),
    prisma.fine.count({ where: { is_paid: true } }),
    prisma.fine.count({ where: { is_paid: false } }),
  ]);

  return {
    totalRevenue: totalRevenue._sum.amount || 0,
    paidRevenue: paidRevenue._sum.amount || 0,
    unpaidRevenue: unpaidRevenue._sum.amount || 0,
    paidCount,
    unpaidCount,
  };
}
