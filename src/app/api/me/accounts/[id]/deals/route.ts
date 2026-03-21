import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const jwt = await getUser();
  if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const account = await prisma.linkedAccount.findFirst({
    where: { id, userId: jwt.userId },
  });
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "100", 10) || 100, 500);
  const deals = await prisma.deal.findMany({
    where: { accountId: id },
    orderBy: { closedAt: "desc" },
    take: limit,
  });
  return NextResponse.json(deals);
}
