import * as bookService from "../services/bookService.js";
import { success, error } from "../utils/responseHelper.js";

export async function list(req, res, next) {
  try {
    const { search = "", page, limit, available, category } = req.query;
    const result = await bookService.listBooks(search, page, limit, available, category);
    return success(res, { books: result.data, pagination: { total: result.total, page: result.page, limit: result.limit, pages: result.pages } });
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid book id", 400);
    const book = await bookService.getBook(id);
    return success(res, { book });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const { title, author, isbn, category, total_quantity } = req.body;
    if (!title || !author || !isbn || !category) return error(res, "title, author, isbn, and category are required", 400);
    const book = await bookService.createBook({ title, author, isbn, category, total_quantity });
    return success(res, { book }, "Book created", 201);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid book id", 400);
    const book = await bookService.updateBook(id, req.body);
    return success(res, { book }, "Book updated");
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return error(res, "Invalid book id", 400);
    await bookService.softDeleteBook(id);
    return success(res, null, "Book deleted");
  } catch (err) { next(err); }
}
