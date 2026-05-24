import axios from "axios";
import { ENV } from "../config/env.js";

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export async function fetchByIsbn(isbn) {
  try {
    const { data } = await axios.get(BASE_URL, {
      params: { q: `isbn:${isbn}`, key: ENV.GOOGLE_BOOKS_API_KEY },
      timeout: 8000,
    });

    if (!data.totalItems || !data.items?.length) return null;

    const info = data.items[0].volumeInfo;
    return {
      description: info.description || null,
      cover_image_url: info.imageLinks?.thumbnail?.replace("http://", "https://") || null,
      language: info.language || null,
      page_count: info.pageCount || null,
      rating: info.averageRating || null,
      publish_year: info.publishedDate ? parseInt(info.publishedDate, 10) : null,
      publisher: info.publisher || null,
    };
  } catch (err) {
    console.error(`[GoogleBooks] ISBN ${isbn} failed:`, err.message);
    return null;
  }
}
