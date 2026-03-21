import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { fetchAccounts } from "@/lib/orchestrator";

export async function GET() {
  const jwt = await getUser();
  if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await prisma.linkedAccount.findMany({
    where: { userId: jwt.userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(accounts);
}

export async function POST(request: NextRequest) {
  const jwt = await getUser();
  if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { server, login } = await request.json();
  if (!server || !login) {
    return NextResponse.json({ error: "server and login are required" }, { status: 400 });
  }

  // Verify account exists in orchestrator
  const orchAccounts = await fetchAccounts();
  const match = orchAccounts.find(
    (a) => a.server === server && a.login === String(login)
  );
  if (!match) {
    return NextResponse.json(
      { error: `Account ${login}@${server} not found in fleet orchestrator` },
      { status: 404 }
    );
  }

  // Check not already linked by this user
  const existing = await prisma.linkedAccount.findUnique({
    where: { userId_server_login: { userId: jwt.userId, server, login: String(login) } },
  });
  if (existing) {
    return NextResponse.json({ error: "Account already linked" }, { status: 409 });
  }

  const account = await prisma.linkedAccount.create({
    data: {
      userId: jwt.userId,
      orchestratorAccountId: match.id,
      vpsId: match.vpsId,
      server: match.server,
      login: match.login,
      broker: match.broker,
      balance: match.balance,
      equity: match.equity,
      unrealizedPnl: match.profit,
    },
  });
  return NextResponse.json(account, { status: 201 });
}
