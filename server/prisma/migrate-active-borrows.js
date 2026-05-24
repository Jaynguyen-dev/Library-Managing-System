import prisma from "../src/config/db.js";

async function migrateActiveBorrows() {
  console.log("Checking for active borrows with incorrect due dates...");

  const activeBorrows = await prisma.borrowRecord.findMany({
    where: { status: "active" },
    select: { id: true, borrow_date: true, due_date: true },
  });

  let updated = 0;

  for (const borrow of activeBorrows) {
    const expectedDue = new Date(borrow.borrow_date);
    expectedDue.setDate(expectedDue.getDate() + 30);

    const diff = Math.abs(expectedDue.getTime() - new Date(borrow.due_date).getTime());
    const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && diffDays !== 30) {
      await prisma.borrowRecord.update({
        where: { id: borrow.id },
        data: { due_date: expectedDue },
      });
      updated++;
      console.log(
        `  Borrow #${borrow.id}: due_date ${borrow.due_date.toISOString().slice(0, 10)} → ${expectedDue.toISOString().slice(0, 10)}`
      );
    }
  }

  if (updated === 0) {
    console.log("All active borrows already have correct 30-day due dates.");
  } else {
    console.log(`Updated ${updated} active borrow record(s) to have 30-day duration.`);
  }

  await prisma.$disconnect();
}

migrateActiveBorrows().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
