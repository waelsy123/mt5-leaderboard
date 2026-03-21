import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { settings: true, accounts: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const settings = user.settings;
  const accounts = user.accounts.map((a) => ({
    id: a.id,
    server: a.server,
    login: a.login,
    broker: a.broker,
    balance: settings?.showPnl ? a.balance : undefined,
    equity: settings?.showPnl ? a.equity : undefined,
    realizedPnl: settings?.showPnl ? a.realizedPnl : undefined,
    unrealizedPnl: settings?.showPnl ? a.unrealizedPnl : undefined,
    totalDeposits: settings?.showDeposits ? a.totalDeposits : undefined,
    totalWithdrawals: settings?.showPayouts ? a.totalWithdrawals : undefined,
    roi: settings?.showPnl ? a.roi : undefined,
  }));

  return NextResponse.json({
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    memberSince: user.createdAt,
    settings: {
      showPnl: settings?.showPnl ?? false,
      showPositions: settings?.showPositions ?? false,
      showDeposits: settings?.showDeposits ?? false,
      showPayouts: settings?.showPayouts ?? false,
    },
    accounts,
  });
}
