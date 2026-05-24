import prisma from "../config/db.js";

export async function getSummary() {
  const now = new Date();

  const [totalBooks, totalUsers, activeBorrows, overdueCount, unpaidFinesAgg, activeBorrowsList, categoryDist, pendingReturnsCount, waitingReservations, notifiedReservations] =
    await Promise.all([
      prisma.book.count({ where: { is_deleted: false } }),
      prisma.user.count(),
      prisma.borrowRecord.count({ where: { status: "active" } }),
      prisma.borrowRecord.count({ where: { status: { in: ["active", "return_pending"] }, due_date: { lt: now } } }),
      prisma.fine.aggregate({ where: { is_paid: false }, _sum: { amount: true } }),
      prisma.borrowRecord.findMany({
        where: { status: { in: ["active", "return_pending"] }, due_date: { lt: now } },
        include: {
          user: { select: { id: true, full_name: true } },
          items: { include: { book: { select: { id: true, title: true } } } },
        },
        orderBy: { due_date: "asc" },
        take: 20,
      }),
      prisma.book.groupBy({
        by: ["category"],
        _count: { id: true },
        where: { is_deleted: false },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.borrowRecord.count({ where: { status: "return_pending" } }),
      prisma.reservation.count({ where: { status: "waiting" } }),
      prisma.reservation.count({ where: { status: "notified" } }),
    ]);

  return {
    totalBooks,
    totalUsers,
    activeBorrows,
    overdueCount,
    pendingReturnsCount,
    waitingReservations,
    notifiedReservations,
    unpaidFinesTotal: unpaidFinesAgg._sum.amount || 0,
    overdueList: activeBorrowsList,
    categoryDistribution: categoryDist.map((c) => ({ category: c.category, count: c._count.id })),
  };
}

export async function getMySummary(userId) {
  const now = new Date();
  const [activeBorrows, overdueCount, unpaidFines, returnedCount, activeReservations] = await Promise.all([
    prisma.borrowRecord.count({ where: { user_id: userId, status: "active" } }),
    prisma.borrowRecord.count({ where: { user_id: userId, status: "active", due_date: { lt: now } } }),
    prisma.fine.findMany({
      where: { user_id: userId, is_paid: false },
      orderBy: { created_at: "desc" },
      take: 20,
      include: {
        borrow_record: {
          select: {
            id: true,
            due_date: true,
            items: {
              select: {
                book: {
                  select: { id: true, title: true, isbn: true, metadata: { select: { cover_image_url: true } } },
                },
              },
            },
          },
        },
      },
    }),
    prisma.borrowRecord.count({ where: { user_id: userId, status: "returned" } }),
    prisma.reservation.count({ where: { user_id: userId, status: { in: ["waiting", "notified"] } } }),
  ]);

  const totalUnpaidAmount = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

  return {
    activeBorrows,
    overdueCount,
    totalBorrows: activeBorrows + overdueCount + returnedCount,
    activeReservations,
    unpaidFinesTotal: totalUnpaidAmount,
    unpaidFines: unpaidFines,
  };
}
