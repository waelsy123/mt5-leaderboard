import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { fetchAccounts } from "@/lib/orchestrator";

const SUPPORTED_BROKERS = ["ftmo", "aquafunded"];

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

  const { broker, server, login, password } = await request.json();

  // Validations
  if (!broker || !server || !login || !password) {
    return NextResponse.json(
      { error: "All fields are required: prop firm, server, login, and read-only password." },
      { status: 400 }
    );
  }

  if (!SUPPORTED_BROKERS.includes(broker)) {
    return NextResponse.json(
      { error: `"${broker}" is not a supported prop firm. Currently supported: FTMO, AquaFunded.` },
      { status: 400 }
    );
  }

  // Reject demo servers
  if (server.toLowerCase().includes("demo")) {
    return NextResponse.json(
      { error: "Demo accounts are not eligible for cashback. Please use a live challenge account." },
      { status: 400 }
    );
  }

  // Check not already linked by this user
  const existing = await prisma.linkedAccount.findUnique({
    where: { userId_server_login: { userId: jwt.userId, server, login: String(login) } },
  });
  if (existing) {
    return NextResponse.json({ error: "This account is already linked to your profile." }, { status: 409 });
  }

  // Try to find in orchestrator (if already managed)
  let orchestratorAccountId = "pending";
  let balance = 0;
  let equity = 0;
  try {
    const orchAccounts = await fetchAccounts();
    const match = orchAccounts.find(
      (a) => a.server === server && a.login === String(login)
    );
    if (match) {
      orchestratorAccountId = match.id;
      balance = match.balance;
      equity = match.equity;
    }
  } catch {
    // Orchestrator not reachable — still accept the submission as pending
  }

  // Create as pending verification
  const account = await prisma.linkedAccount.create({
    data: {
      userId: jwt.userId,
      orchestratorAccountId,
      vpsId: "pending",
      server,
      login: String(login),
      broker,
      balance,
      equity,
    },
  });

  return NextResponse.json({
    ...account,
    message: "Account submitted for verification. We will verify it has zero trade history and is a live challenge.",
    status: "PENDING",
  }, { status: 201 });
}
