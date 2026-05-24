import bcrypt from "bcrypt";
import prisma from "../config/db.js";
import { paginate } from "../utils/paginate.js";

export async function listUsers(role, page, limit) {
  const where = {};
  if (role) where.role = role;
  return paginate(prisma.user, {
    where,
    select: { id: true, full_name: true, email: true, role: true, is_active: true, created_at: true },
    orderBy: { created_at: "desc" },
  }, page, limit);
}

export async function createUser(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw Object.assign(new Error("Email already exists"), { statusCode: 400 });

  const passwordHash = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      full_name: data.full_name,
      email: data.email,
      password_hash: passwordHash,
      role: data.role || "student",
    },
    select: { id: true, full_name: true, email: true, role: true, is_active: true, created_at: true },
  });
}

export async function updateUser(id, data) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  const updateData = {};
  if (data.full_name) updateData.full_name = data.full_name;
  if (data.email) {
    const dup = await prisma.user.findUnique({ where: { email: data.email } });
    if (dup && dup.id !== id) throw Object.assign(new Error("Email already exists"), { statusCode: 400 });
    updateData.email = data.email;
  }
  if (data.role) updateData.role = data.role;

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, full_name: true, email: true, role: true, is_active: true, created_at: true },
  });
}

export async function toggleActive(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  return prisma.user.update({
    where: { id },
    data: { is_active: !user.is_active },
    select: { id: true, full_name: true, email: true, role: true, is_active: true, created_at: true },
  });
}
