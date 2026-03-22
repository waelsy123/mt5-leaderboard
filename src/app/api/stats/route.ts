import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [totalTraders, totalAccounts, activeChallenges, cashbackPaid, volumeAgg] =
    await Promise.all([
      prisma.user.count(),
      prisma.linkedAccount.count(),
      prisma.challenge.count({ where: { status: "ACTIVE" } }),
      prisma.challenge.aggregate({
        _sum: { cashbackAmount: true },
        where: { cashbackStatus: "PAID" },
      }),
      prisma.linkedAccount.aggregate({
        _sum: { balance: true },
      }),
    ]);

  return NextResponse.json({
    totalTraders,
    totalAccounts,
    totalVolume: volumeAgg._sum.balance ?? 0,
    totalCashbackPaid: cashbackPaid._sum.cashbackAmount ?? 0,
    activeChallenges,
  });
}
