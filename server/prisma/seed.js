import prisma from "../src/config/db.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import * as openLib from "../src/crawlers/openLibraryCrawler.js";
import { delay } from "../src/crawlers/crawlerUtils.js";

dotenv.config();

const OPEN_LIB_COVERS = "https://covers.openlibrary.org/b/isbn";

async function seedUsers() {
  const hash = (pwd) => bcrypt.hash(pwd, 10);

  const users = [
    { email: "admin@demo.com", full_name: "Admin User", password: await hash("admin123"), role: "admin" },
    { email: "librarian@demo.com", full_name: "Librarian", password: await hash("lib123"), role: "librarian" },
    { email: "student@demo.com", full_name: "Student A", password: await hash("stu123"), role: "student" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password_hash: u.password },
      create: {
        full_name: u.full_name,
        email: u.email,
        password_hash: u.password,
        role: u.role,
      },
    });
  }

  console.log("Users seeded (idempotent upsert)");
}

async function seedBooks() {
  const books = [
    { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", category: "Engineering", total_quantity: 3 },
    { title: "The Pragmatic Programmer", author: "Hunt & Thomas", isbn: "9780135957059", category: "Engineering", total_quantity: 2 },
    { title: "Design Patterns", author: "Gang of Four", isbn: "9780201633610", category: "Engineering", total_quantity: 2 },
    { title: "Introduction to Algorithms", author: "Cormen et al.", isbn: "9780262033848", category: "Computer Science", total_quantity: 2 },
    { title: "The Catcher in the Rye", author: "J.D. Salinger", isbn: "9780316769488", category: "Fiction", total_quantity: 3 },
    { title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "9780061120084", category: "Fiction", total_quantity: 2 },
    { title: "A Brief History of Time", author: "Stephen Hawking", isbn: "9780553380163", category: "Science", total_quantity: 2 },
    { title: "The Art of Computer Programming", author: "Donald Knuth", isbn: "9780201896831", category: "Computer Science", total_quantity: 1 },
    { title: "Database System Concepts", author: "Silberschatz et al.", isbn: "9780073523323", category: "Computer Science", total_quantity: 3 },
    { title: "Sapiens", author: "Yuval Noah Harari", isbn: "9780062316110", category: "History", total_quantity: 3 },
  ];

  for (const b of books) {
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {
        title: b.title,
        author: b.author,
        category: b.category,
        total_quantity: b.total_quantity,
        available_quantity: b.total_quantity,
      },
      create: {
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        category: b.category,
        total_quantity: b.total_quantity,
        available_quantity: b.total_quantity,
      },
    });
  }

  console.log("Books seeded (idempotent upsert)");
}

async function seedMetadata() {
  const books = await prisma.book.findMany({ where: { is_deleted: false, metadata: null } });
  if (books.length === 0) {
    console.log("All books already have metadata — skipping");
    return;
  }

  for (const book of books) {
    const coverUrl = `${OPEN_LIB_COVERS}/${book.isbn}-L.jpg`;

    let olData = null;
    try {
      olData = await openLib.fetchByIsbn(book.isbn);
      await delay(350);
    } catch {
      console.log(`  [ISBN ${book.isbn}] Open Library crawl failed, using default cover`);
    }

    const subjectsRaw = olData?.subjects || null;
    const subjectsSafe = subjectsRaw && subjectsRaw.length > 500 ? subjectsRaw.slice(0, 497) + "..." : subjectsRaw;

    await prisma.bookMetadata.upsert({
      where: { book_id: book.id },
      create: {
        book_id: book.id,
        cover_image_url: olData?.cover_image_url || coverUrl,
        description: olData?.description || null,
        publisher: olData?.publisher || null,
        publish_year: olData?.publish_year || null,
        subjects: subjectsSafe,
        page_count: olData?.page_count || null,
        source_url: olData?.source_url || null,
        crawled_at: new Date(),
      },
      update: {
        cover_image_url: olData?.cover_image_url || coverUrl,
        description: olData?.description || null,
        publisher: olData?.publisher || null,
        publish_year: olData?.publish_year || null,
        subjects: subjectsSafe,
        page_count: olData?.page_count || null,
        source_url: olData?.source_url || null,
        crawled_at: new Date(),
      },
    });

    console.log(`  [${book.isbn}] ${book.title}: ${olData ? "enriched from Open Library" : "default cover URL set"}`);
  }

  console.log(`BookMetadata seeded for ${books.length} books`);
}

async function seedBorrowRecords() {
  const existingCount = await prisma.borrowRecord.count();
  if (existingCount > 0) {
    console.log("Borrow records already exist — skipping to preserve data integrity");
    return;
  }

  const student = await prisma.user.findFirst({ where: { role: "student" } });
  const books = await prisma.book.findMany();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const borrow1 = await prisma.borrowRecord.create({
    data: {
      user_id: student.id,
      borrow_date: thirtyDaysAgo,
      due_date: thirtyDaysFromNow,
      return_date: now,
      status: "returned",
      items: {
        create: [{ book_id: books[3].id, quantity: 1 }],
      },
    },
  });

  console.log("On-time borrow record created");

  const pastDate3 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const borrow2 = await prisma.borrowRecord.create({
    data: {
      user_id: student.id,
      borrow_date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      due_date: thirtyDaysAgo,
      return_date: pastDate3,
      status: "returned",
      items: {
        create: [{ book_id: books[0].id, quantity: 1 }],
      },
    },
  });

  await prisma.fine.create({
    data: {
      borrow_record_id: borrow2.id,
      user_id: student.id,
      amount: 14000,
      reason: "Overdue return",
      is_paid: false,
    },
  });

  console.log("Overdue borrow record (returned) + fine created");
}

async function main() {
  console.log("Seeding database...");

  await seedUsers();
  await seedBooks();
  await seedMetadata();
  await seedBorrowRecords();

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
