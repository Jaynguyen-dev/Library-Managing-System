import axios from "axios";

const BASE_URL = "https://openlibrary.org/api/books";

export async function fetchByIsbn(isbn) {
  const bibkey = `ISBN:${isbn}`;
  const url = `${BASE_URL}?bibkeys=${bibkey}&format=json&jscmd=data`;

  try {
    const { data } = await axios.get(url, {
      timeout: 8000,
      headers: { "User-Agent": "LMS-SE104-Crawler/1.0 (student project)" },
    });

    const book = data[bibkey];
    if (!book) return null;

    return {
      cover_image_url: book.cover?.large || book.cover?.medium || null,
      description: book.notes || null,
      publisher: book.publishers?.[0]?.name || null,
      publish_year: book.publish_date ? parseInt(book.publish_date, 10) : null,
      subjects: JSON.stringify(book.subjects?.map((s) => s.name) || []),
      page_count: book.number_of_pages || null,
      source_url: book.url || null,
    };
  } catch (err) {
    console.error(`[OpenLibrary] ISBN ${isbn} failed:`, err.message);
    return null;
  }
}
