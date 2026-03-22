import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const jwt = await getUser();
  if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const challenges = await prisma.challenge.findMany({
    where: { userId: jwt.userId },
    orderBy: { startDate: "desc" },
    include: { account: { select: { id: true, server: true, login: true, broker: true } } },
  });

  return NextResponse.json(challenges);
}

export async function POST(request: NextRequest) {
  const jwt = await getUser();
  if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { broker, challengeType, accountSize, startBalance, profitTarget, maxDrawdown, walletAddress } = body;

  if (!broker || !challengeType || !accountSize || startBalance == null || profitTarget == null || maxDrawdown == null) {
    return NextResponse.json(
      { error: "broker, challengeType, accountSize, startBalance, profitTarget, and maxDrawdown are required" },
      { status: 400 }
    );
  }

  const challenge = await prisma.challenge.create({
    data: {
      userId: jwt.userId,
      broker,
      challengeType,
      accountSize,
      startBalance,
      profitTarget,
      maxDrawdown,
      walletAddress: walletAddress || null,
    },
  });

  return NextResponse.json(challenge, { status: 201 });
}
