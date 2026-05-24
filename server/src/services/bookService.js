import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function listBooks(search) {
  const where = { is_deleted: false };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { isbn: { contains: search } },
      { author: { contains: search } },
    ];
  }
  return prisma.book.findMany({
    where,
    include: { metadata: true },
    orderBy: { created_at: "desc" },
  });
}

export async function getBook(id) {
  const book = await prisma.book.findUnique({
    where: { id },
    include: { metadata: true },
  });
  if (!book || book.is_deleted) throw Object.assign(new Error("Book not found"), { statusCode: 404 });
  return book;
}

export async function createBook(data) {
  const existing = await prisma.book.findUnique({ where: { isbn: data.isbn } });
  if (existing) throw Object.assign(new Error("ISBN already exists"), { statusCode: 400 });

  return prisma.book.create({
    data: {
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      category: data.category,
      total_quantity: data.total_quantity || 1,
      available_quantity: data.total_quantity || 1,
    },
    include: { metadata: true },
  });
}

export async function updateBook(id, data) {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book || book.is_deleted) throw Object.assign(new Error("Book not found"), { statusCode: 404 });

  if (data.isbn && data.isbn !== book.isbn) {
    const dup = await prisma.book.findUnique({ where: { isbn: data.isbn } });
    if (dup) throw Object.assign(new Error("ISBN already exists"), { statusCode: 400 });
  }

  return prisma.book.update({
    where: { id },
    data,
    include: { metadata: true },
  });
}

export async function softDeleteBook(id) {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw Object.assign(new Error("Book not found"), { statusCode: 404 });

  return prisma.book.update({
    where: { id },
    data: { is_deleted: true },
  });
}
