import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getSummary() {
  const [totalBooks, totalUsers, activeBorrows, overdueCount, unpaidFinesAgg, overdueList] =
    await Promise.all([
      prisma.book.count({ where: { is_deleted: false } }),
      prisma.user.count(),
      prisma.borrowRecord.count({ where: { status: "active" } }),
      prisma.borrowRecord.count({ where: { status: "overdue" } }),
      prisma.fine.aggregate({ where: { is_paid: false }, _sum: { amount: true } }),
      prisma.borrowRecord.findMany({
        where: { status: "overdue" },
        include: {
          user: { select: { id: true, full_name: true } },
          items: { include: { book: { select: { id: true, title: true } } } },
        },
        orderBy: { due_date: "asc" },
        take: 20,
      }),
    ]);

  return {
    totalBooks,
    totalUsers,
    activeBorrows,
    overdueCount,
    unpaidFinesTotal: unpaidFinesAgg._sum.amount || 0,
    overdueList,
  };
}
