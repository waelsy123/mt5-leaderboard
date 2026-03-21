import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { fetchPositions } from "@/lib/orchestrator";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const jwt = await getUser();
  if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const account = await prisma.linkedAccount.findFirst({
    where: { id, userId: jwt.userId },
  });
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  try {
    const positions = await fetchPositions(account.vpsId, account.server, account.login);
    return NextResponse.json(positions);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
