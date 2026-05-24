import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { ENV } from "../config/env.js";

export async function register(fullName, email, password) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Object.assign(new Error("Email already registered"), { statusCode: 400 });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { full_name: fullName, email, password_hash: passwordHash, role: "user" },
    select: { id: true, full_name: true, email: true, role: true, is_active: true, created_at: true },
  });
  return user;
}

export async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });

  if (!user.is_active) throw Object.assign(new Error("Account is disabled"), { statusCode: 403 });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });

  const token = jwt.sign({ id: user.id, role: user.role }, ENV.JWT_SECRET, { expiresIn: "24h" });
  return {
    token,
    user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
  };
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, full_name: true, email: true, role: true, is_active: true, created_at: true },
  });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user;
}
