import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check user exists and has showPnl enabled
  const user = await prisma.user.findUnique({
    where: { id },
    include: { settings: true, accounts: { select: { id: true } } },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!user.settings?.showPnl) {
    return NextResponse.json({ error: "User has not shared PNL data" }, { status: 403 });
  }

  const days = Math.min(parseInt(request.nextUrl.searchParams.get("days") || "30", 10) || 30, 90);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const accountIds = user.accounts.map((a) => a.id);

  if (accountIds.length === 0) return NextResponse.json([]);

  const snapshots = await prisma.pnlSnapshot.findMany({
    where: { accountId: { in: accountIds }, timestamp: { gte: since } },
    orderBy: { timestamp: "asc" },
    select: { timestamp: true, equity: true, balance: true, realizedPnl: true },
  });

  // Aggregate by timestamp (group snapshots from same time across accounts)
  const grouped = new Map<string, { equity: number; balance: number; realizedPnl: number }>();
  for (const s of snapshots) {
    // Round to 5-minute bucket
    const bucket = new Date(Math.round(s.timestamp.getTime() / 300000) * 300000).toISOString();
    const existing = grouped.get(bucket) || { equity: 0, balance: 0, realizedPnl: 0 };
    existing.equity += s.equity;
    existing.balance += s.balance;
    existing.realizedPnl += s.realizedPnl;
    grouped.set(bucket, existing);
  }

  const curve = Array.from(grouped.entries()).map(([timestamp, data]) => ({
    timestamp,
    equity: Math.round(data.equity * 100) / 100,
    balance: Math.round(data.balance * 100) / 100,
    realizedPnl: Math.round(data.realizedPnl * 100) / 100,
  }));

  return NextResponse.json(curve);
}
