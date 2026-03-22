import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// Cashback lookup: accountSize -> cashback amount (20% of challenge fee)
const CASHBACK_TABLE: Record<number, number> = {
  10000: 20,
  25000: 40,
  50000: 60,
  100000: 100,
  200000: 200,
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const jwt = await getUser();
  if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify ownership
  const existing = await prisma.challenge.findFirst({
    where: { id, userId: jwt.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const body = await request.json();
  const { status, result, endBalance, walletAddress } = body;

  const updateData: Record<string, unknown> = {};

  if (status !== undefined) updateData.status = status;
  if (result !== undefined) updateData.result = result;
  if (endBalance !== undefined) updateData.endBalance = endBalance;
  if (walletAddress !== undefined) updateData.walletAddress = walletAddress;

  // Auto-calculate cashback when status changes to COMPLETED
  if (status === "COMPLETED") {
    updateData.endDate = new Date();

    // If result is PASSED, calculate cashback and set to ELIGIBLE
    const finalResult = result ?? existing.result;
    if (finalResult === "PASSED") {
      const cashback = CASHBACK_TABLE[existing.accountSize] ?? 0;
      updateData.cashbackAmount = cashback;
      updateData.cashbackStatus = "ELIGIBLE";
    } else {
      // FAILED or BREACHED: no cashback
      updateData.cashbackAmount = 0;
      updateData.cashbackStatus = "REJECTED";
    }
  }

  const updated = await prisma.challenge.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}
