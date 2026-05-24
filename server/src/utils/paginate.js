export async function paginate(model, args, page = 1, limit = 20) {
  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    model.findMany({ ...args, skip, take: limit }),
    model.count({ where: args.where }),
  ]);
  return { data, total, page, limit, pages: Math.ceil(total / limit) };
}
