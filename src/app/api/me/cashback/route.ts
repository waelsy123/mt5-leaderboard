import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const jwt = await getUser();
  if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const challenges = await prisma.challenge.findMany({
    where: { userId: jwt.userId },
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      broker: true,
      challengeType: true,
      accountSize: true,
      status: true,
      result: true,
      cashbackAmount: true,
      cashbackStatus: true,
      cashbackPaidAt: true,
      walletAddress: true,
      startDate: true,
      endDate: true,
    },
  });

  const totalEarned = challenges.reduce(
    (sum, c) => sum + (c.cashbackStatus !== "REJECTED" ? c.cashbackAmount : 0),
    0
  );

  const totalPaid = challenges.reduce(
    (sum, c) => sum + (c.cashbackStatus === "PAID" ? c.cashbackAmount : 0),
    0
  );

  const totalPending = challenges.reduce(
    (sum, c) =>
      sum +
      (c.cashbackStatus === "ELIGIBLE" || c.cashbackStatus === "PROCESSING" || c.cashbackStatus === "PENDING"
        ? c.cashbackAmount
        : 0),
    0
  );

  return NextResponse.json({
    totalEarned,
    totalPaid,
    totalPending,
    challenges,
  });
}
