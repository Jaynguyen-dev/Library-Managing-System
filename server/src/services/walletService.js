import prisma from "../config/db.js";

export async function getOrCreateWallet(userId) {
  let wallet = await prisma.wallet.findUnique({ where: { user_id: userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { user_id: userId, balance: 0 },
    });
  }
  return wallet;
}

export async function getWallet(userId) {
  const wallet = await prisma.wallet.findUnique({
    where: { user_id: userId },
    include: {
      transactions: { orderBy: { created_at: "desc" }, take: 50 },
    },
  });
  if (!wallet) {
    return getOrCreateWallet(userId);
  }
  return wallet;
}

export async function addCredits(userId, amount, paymentMethod) {
  if (!amount || amount <= 0) throw Object.assign(new Error("Invalid amount"), { statusCode: 400 });
  if (amount > 100000000) throw Object.assign(new Error("Amount exceeds maximum (100,000,000)"), { statusCode: 400 });

  const validMethods = ["visa", "mastercard", "momo", "banking"];
  if (!validMethods.includes(paymentMethod)) {
    throw Object.assign(new Error("Invalid payment method"), { statusCode: 400 });
  }

  return prisma.$transaction(async (tx) => {
    let wallet = await tx.wallet.findUnique({ where: { user_id: userId } });
    if (!wallet) {
      wallet = await tx.wallet.create({ data: { user_id: userId, balance: 0 } });
    }

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });

    await tx.walletTransaction.create({
      data: {
        wallet_id: wallet.id,
        amount,
        balance_before: wallet.balance,
        balance_after: wallet.balance + amount,
        type: "topup",
        status: "completed",
        payment_method: paymentMethod,
        description: `Top-up via ${paymentMethod}`,
      },
    });

    return updatedWallet;
  });
}

export async function deductFromWallet(userId, amount, reference, description) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { user_id: userId } });
    if (!wallet) throw Object.assign(new Error("Wallet not found"), { statusCode: 404 });
    if (wallet.balance < amount) throw Object.assign(new Error("Insufficient balance"), { statusCode: 400 });

    const updated = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    });

    await tx.walletTransaction.create({
      data: {
        wallet_id: wallet.id,
        amount: -amount,
        balance_before: wallet.balance,
        balance_after: wallet.balance - amount,
        type: "deduction",
        status: "completed",
        payment_method: "system",
        reference,
        description: description || "Wallet deduction",
      },
    });

    return updated;
  });
}

export async function getTransactions(userId, page = 1, limit = 20) {
  const wallet = await prisma.wallet.findUnique({ where: { user_id: userId } });
  if (!wallet) return { data: [], pagination: { total: 0, page, limit, pages: 0 } };

  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: { wallet_id: wallet.id },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.walletTransaction.count({ where: { wallet_id: wallet.id } }),
  ]);

  return {
    data: transactions,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
}
