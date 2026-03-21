import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const sort = request.nextUrl.searchParams.get("sort") || "realizedPnl";
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "50", 10) || 50, 100);

  // Only include users who opted to show PNL
  const users = await prisma.user.findMany({
    where: { settings: { showPnl: true } },
    include: {
      accounts: { select: { balance: true, equity: true, realizedPnl: true, unrealizedPnl: true, totalDeposits: true, totalWithdrawals: true, roi: true } },
      settings: true,
    },
  });

  const entries = users.map((u) => {
    const totalBalance = u.accounts.reduce((s, a) => s + a.balance, 0);
    const totalEquity = u.accounts.reduce((s, a) => s + a.equity, 0);
    const totalRealizedPnl = u.accounts.reduce((s, a) => s + a.realizedPnl, 0);
    const totalUnrealizedPnl = u.accounts.reduce((s, a) => s + a.unrealizedPnl, 0);
    const totalDeposits = u.accounts.reduce((s, a) => s + a.totalDeposits, 0);
    const totalWithdrawals = u.accounts.reduce((s, a) => s + a.totalWithdrawals, 0);
    const roi = totalDeposits > 0 ? (totalRealizedPnl / totalDeposits) * 100 : 0;

    return {
      userId: u.id,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      accountCount: u.accounts.length,
      totalBalance: Math.round(totalBalance * 100) / 100,
      totalEquity: Math.round(totalEquity * 100) / 100,
      totalRealizedPnl: Math.round(totalRealizedPnl * 100) / 100,
      totalUnrealizedPnl: Math.round(totalUnrealizedPnl * 100) / 100,
      totalDeposits: u.settings?.showDeposits ? Math.round(totalDeposits * 100) / 100 : undefined,
      totalWithdrawals: u.settings?.showPayouts ? Math.round(totalWithdrawals * 100) / 100 : undefined,
      roi: Math.round(roi * 100) / 100,
    };
  });

  const sortKey = sort as keyof (typeof entries)[0];
  entries.sort((a, b) => {
    const av = (typeof a[sortKey] === "number" ? a[sortKey] : 0) as number;
    const bv = (typeof b[sortKey] === "number" ? b[sortKey] : 0) as number;
    return bv - av;
  });

  const ranked = entries.slice(0, limit).map((e, i) => ({ rank: i + 1, ...e }));
  return NextResponse.json(ranked);
}
