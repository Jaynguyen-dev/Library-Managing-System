import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function listFines(isPaid) {
  const where = {};
  if (isPaid !== undefined) where.is_paid = isPaid === "true" || isPaid === true;

  return prisma.fine.findMany({
    where,
    include: {
      borrow_record: { select: { id: true, borrow_date: true, due_date: true } },
      user: { select: { id: true, full_name: true, email: true } },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function payFine(id) {
  const fine = await prisma.fine.findUnique({ where: { id } });
  if (!fine) throw Object.assign(new Error("Fine not found"), { statusCode: 404 });
  if (fine.is_paid) throw Object.assign(new Error("Fine already paid"), { statusCode: 400 });

  return prisma.fine.update({
    where: { id },
    data: { is_paid: true },
    include: {
      borrow_record: { select: { id: true, borrow_date: true, due_date: true } },
      user: { select: { id: true, full_name: true, email: true } },
    },
  });
}
