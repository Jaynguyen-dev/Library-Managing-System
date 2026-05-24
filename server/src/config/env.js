import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT, 10) || 3001,
  JWT_SECRET: process.env.JWT_SECRET || "fallback_secret_change_me",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  DATABASE_URL: process.env.DATABASE_URL,
  GOOGLE_BOOKS_API_KEY: process.env.GOOGLE_BOOKS_API_KEY || "",
  CRAWL_CONCURRENCY: parseInt(process.env.CRAWL_CONCURRENCY, 10) || 3,
  CRAWL_DELAY_MS: parseInt(process.env.CRAWL_DELAY_MS, 10) || 500,
};
