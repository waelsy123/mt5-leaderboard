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

  // Demo multipliers for presentation
  const boostedTraders = totalTraders * 50;
  const boostedVolume = volume + 2_500_000;
  const boostedCashback = cashback + 15_000;
  const boostedChallenges = activeChallenges + 200;

  return NextResponse.json({
    activeTraders: boostedTraders,
    totalAccounts,
    totalVolume: `$${boostedVolume.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    cashbackPaid: `$${boostedCashback.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    activeChallenges: boostedChallenges,
  });
}
