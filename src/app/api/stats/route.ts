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

  const volume = volumeAgg._sum.balance ?? 0;
  const cashback = cashbackPaid._sum.cashbackAmount ?? 0;

  return NextResponse.json({
    activeTraders: totalTraders,
    totalAccounts,
    totalVolume: `$${volume.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    cashbackPaid: `$${cashback.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    activeChallenges,
  });
}
