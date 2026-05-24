import { PrismaClient } from "@prisma/client";
import * as openLib from "../crawlers/openLibraryCrawler.js";
import * as googleBooks from "../crawlers/googleBooksCrawler.js";
import { delay } from "../crawlers/crawlerUtils.js";
import { ENV } from "../config/env.js";

const prisma = new PrismaClient();

export async function enrichByIsbn(isbn) {
  const book = await prisma.book.findUnique({ where: { isbn } });
  if (!book) throw new Error(`Book with ISBN ${isbn} not found`);

  const log = await prisma.crawlLog.create({
    data: { job_type: "isbn_lookup", isbn, status: "running", source: "multi" },
  });

  try {
    const [olResult, gbResult] = await Promise.allSettled([
      openLib.fetchByIsbn(isbn),
      googleBooks.fetchByIsbn(isbn),
    ]);

    const olData = olResult.status === "fulfilled" ? olResult.value : null;
    const gbData = gbResult.status === "fulfilled" ? gbResult.value : null;

    const merged = {
      ...(gbData || {}),
      ...(olData || {}),
      crawled_at: new Date(),
      source_url: olData?.source_url || null,
    };

    const hasData = Object.entries(merged).some(
      ([k, v]) => k !== "crawled_at" && v !== null && v !== undefined
    );

    if (!hasData) {
      await prisma.crawlLog.update({
        where: { id: log.id },
        data: { status: "failed", error_msg: "No data returned by any source", finished_at: new Date() },
      });
      return { success: false, isbn };
    }

    await prisma.bookMetadata.upsert({
      where: { book_id: book.id },
      create: { book_id: book.id, ...merged },
      update: merged,
    });

    await prisma.crawlLog.update({
      where: { id: log.id },
      data: { status: "success", books_found: 1, books_updated: 1, finished_at: new Date() },
    });

    return { success: true, isbn, metadata: merged };
  } catch (err) {
    await prisma.crawlLog.update({
      where: { id: log.id },
      data: { status: "failed", error_msg: err.message, finished_at: new Date() },
    });
    throw err;
  }
}

export async function batchEnrich() {
  const books = await prisma.book.findMany({
    where: { is_deleted: false, metadata: null },
    select: { isbn: true },
  });

  console.log(`[CrawlService] Batch enriching ${books.length} books...`);
  const results = { success: 0, failed: 0 };

  for (let i = 0; i < books.length; i += ENV.CRAWL_CONCURRENCY) {
    const batch = books.slice(i, i + ENV.CRAWL_CONCURRENCY);
    await Promise.allSettled(
      batch.map((b) =>
        enrichByIsbn(b.isbn)
          .then(() => results.success++)
          .catch(() => results.failed++)
      )
    );
    if (i + ENV.CRAWL_CONCURRENCY < books.length) await delay(ENV.CRAWL_DELAY_MS);
  }

  return results;
}

export async function getLogs() {
  return prisma.crawlLog.findMany({ orderBy: { started_at: "desc" }, take: 100 });
}

export async function deleteOldLogs() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  await prisma.crawlLog.deleteMany({ where: { started_at: { lt: thirtyDaysAgo } } });
  return { message: "Old logs cleaned" };
}
