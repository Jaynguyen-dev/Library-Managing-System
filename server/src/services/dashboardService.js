import prisma from "../config/db.js";

export async function getSummary() {
  const now = new Date();

  const [totalBooks, totalUsers, activeBorrows, overdueCount, unpaidFinesAgg, activeBorrowsList, categoryDist, pendingReturnsCount, waitingReservations, notifiedReservations, finesCollectedAgg, mostBorrowedItems, popularCategoriesRaw] =
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
      prisma.fine.aggregate({ where: { is_paid: true }, _sum: { amount: true } }),
      prisma.borrowItem.groupBy({
        by: ["book_id"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 8,
      }),
      prisma.$queryRawUnsafe(`
        SELECT TOP 5 b.category, COUNT(bi.id) as borrow_count
        FROM dbo.BorrowItem bi
        JOIN dbo.Book b ON bi.book_id = b.id
        WHERE b.is_deleted = 0
        GROUP BY b.category
        ORDER BY borrow_count DESC
      `),
    ]);

  // Resolve top 5 popular categories (most borrowed)
  const popularCategories = (popularCategoriesRaw || []).map(c => ({
    category: c.category,
    borrowCount: Number(c.borrow_count),
  }));

  // Resolve book details for most borrowed
  const topBookIds = mostBorrowedItems.map(b => b.book_id);
  const topBooks = topBookIds.length > 0
    ? await prisma.book.findMany({
        where: { id: { in: topBookIds } },
        select: { id: true, title: true, author: true, category: true },
      })
    : [];
  const mostBorrowed = mostBorrowedItems.map(b => {
    const book = topBooks.find(book => book.id === b.book_id);
    return {
      id: b.book_id,
      title: book?.title || "Unknown",
      author: book?.author || "Unknown",
      category: book?.category || "Unknown",
      borrowCount: b._count.id,
    };
  });

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
    popularCategories,
    circulationReports: {
      totalOverdue: overdueCount,
      totalFinesCollected: finesCollectedAgg._sum.amount || 0,
      totalFinesUnpaid: unpaidFinesAgg._sum.amount || 0,
      mostBorrowed,
    },
  };
}

export async function getMySummary(userId) {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [activeBorrows, overdueCount, unpaidFines, returnedCount, activeReservations, recentlyReturned, allReturnedStats, allBorrowCats] = await Promise.all([
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
    prisma.borrowRecord.findMany({
      where: { user_id: userId, status: { in: ["active", "returned"] } },
      include: {
        items: {
          include: { book: { select: { id: true, title: true, author: true, category: true, isbn: true, metadata: { select: { cover_image_url: true } } } } },
        },
      },
      orderBy: { borrow_date: "desc" },
      take: 10,
    }),
    prisma.borrowRecord.findMany({
      where: { user_id: userId, status: "returned", borrow_date: { gte: sixMonthsAgo } },
      select: { borrow_date: true, return_date: true, items: { select: { book: { select: { category: true } } } } },
    }),
    prisma.borrowRecord.findMany({
      where: { user_id: userId, status: { in: ["returned", "active"] } },
      select: { borrow_date: true, status: true, items: { select: { book: { select: { category: true } } } } },
    }),
  ]);

  const totalUnpaidAmount = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

  // ── DYNAMIC CATEGORY ANALYTICS ──
  // Compute from ALL borrows (returned + active, no time limit)
  const fullCatMap = {};
  let totalBooksInCats = 0;
  for (const rec of allBorrowCats) {
    for (const item of rec.items) {
      const cat = item.book.category || "Uncategorized";
      fullCatMap[cat] = (fullCatMap[cat] || 0) + 1;
      totalBooksInCats++;
    }
  }
  const dynamicCategoryStats = Object.entries(fullCatMap)
    .map(([category, count]) => ({
      category,
      count,
      percentage: totalBooksInCats > 0 ? Math.round((count / totalBooksInCats) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
  const favoriteCategory = dynamicCategoryStats.length > 0 ? dynamicCategoryStats[0].category : null;

  // Category trends by month (from returned books with dates)
  const monthCatMap = {};
  for (const rec of allReturnedStats) {
    const d = new Date(rec.borrow_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthCatMap[key]) monthCatMap[key] = {};
    for (const item of rec.items) {
      const cat = item.book.category || "Uncategorized";
      monthCatMap[key][cat] = (monthCatMap[key][cat] || 0) + 1;
    }
  }

  // Generate personalized insights
  const insights = [];
  if (favoriteCategory && dynamicCategoryStats.length > 0) {
    insights.push(`You read mostly ${favoriteCategory} (${dynamicCategoryStats[0].percentage}% of your books)`);
  }
  const sortedMonths = Object.keys(monthCatMap).sort();
  if (sortedMonths.length >= 2) {
    const currMonthData = monthCatMap[sortedMonths[sortedMonths.length - 1]];
    const prevMonthData = monthCatMap[sortedMonths[sortedMonths.length - 2]];
    for (const [cat, currCount] of Object.entries(currMonthData)) {
      const prevCount = prevMonthData[cat] || 0;
      if (currCount > prevCount) insights.push(`Your ${cat} reading increased this month`);
      else if (currCount < prevCount) insights.push(`Your ${cat} reading decreased this month`);
    }
    for (const [cat] of Object.entries(prevMonthData)) {
      if (!currMonthData[cat]) insights.push(`No ${cat} books this month`);
    }
  }

  // Compute monthly borrowing stats (last 6 months)
  const monthMap = {};
  for (const rec of allReturnedStats) {
    const d = new Date(rec.borrow_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap[key] = (monthMap[key] || 0) + 1;
  }
  const monthlyBorrows = Object.entries(monthMap)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Compute average reading time (days between borrow and return)
  let totalDays = 0;
  let daysCount = 0;
  for (const rec of allReturnedStats) {
    if (rec.return_date) {
      const days = Math.ceil((new Date(rec.return_date) - new Date(rec.borrow_date)) / (1000 * 60 * 60 * 24));
      totalDays += days;
      daysCount++;
    }
  }
  const avgReadingDays = daysCount > 0 ? Math.round(totalDays / daysCount) : null;

  // Count unique months with activity for "streak" approximation
  const activeMonths = new Set();
  for (const rec of allReturnedStats) {
    const d = new Date(rec.borrow_date);
    activeMonths.add(`${d.getFullYear()}-${d.getMonth()}`);
  }

  // ── ENHANCED MONTHLY ACTIVITY: borrowed vs returned per month (last 6 months) ──
  const actBorrowMap = {};
  const actReturnMap = {};
  const actDateSet = new Set();

  for (const rec of allBorrowCats) {
    const d = new Date(rec.borrow_date);
    if (d >= sixMonthsAgo) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const itemCount = (rec.items || []).length;
      actBorrowMap[key] = (actBorrowMap[key] || 0) + itemCount;
      actDateSet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
  }

  for (const rec of allReturnedStats) {
    if (rec.return_date) {
      const d = new Date(rec.return_date);
      if (d >= sixMonthsAgo) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const itemCount = (rec.items || []).length;
        actReturnMap[key] = (actReturnMap[key] || 0) + itemCount;
        actDateSet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    }
  }

  const monthlyActivity = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyActivity.push({
      month: key,
      borrowed: actBorrowMap[key] || 0,
      returned: actReturnMap[key] || 0,
    });
  }

  const activeReadingDays = actDateSet.size;

  // ── USAGE ANALYTICS: daily activity pattern (day-of-week) ──
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  for (const rec of allBorrowCats) {
    const d = new Date(rec.borrow_date);
    const dayName = dayNames[d.getDay()];
    dayCounts[dayName] += (rec.items || []).length;
  }
  const dailyActivity = dayNames.map(day => ({ day, count: dayCounts[day] || 0 }));
  const peakBorrowDay = [...dailyActivity].sort((a, b) => b.count - a.count)[0]?.day || "N/A";
  const avgWeeklyActivity = dailyActivity.reduce((s, d) => s + d.count, 0) > 0
    ? Math.round(dailyActivity.reduce((s, d) => s + d.count, 0) / Math.max(dailyActivity.filter(d => d.count > 0).length, 1))
    : 0;

  return {
    activeBorrows,
    overdueCount,
    totalBorrows: activeBorrows + overdueCount + returnedCount,
    returnedCount,
    activeReservations,
    unpaidFinesTotal: totalUnpaidAmount,
    unpaidFines,
    recentlyReturned,
    categoryStats: dynamicCategoryStats,
    categoryTrends: monthCatMap,
    monthlyBorrows,
    monthlyActivity,
    activeReadingDays,
    favoriteCategory,
    avgReadingDays,
    readingMonths: activeMonths.size,
    insights,
    dailyActivity,
    peakBorrowDay,
    avgWeeklyActivity,
  };
}
