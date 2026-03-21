import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  const jwt = await getUser();
  if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const data: Record<string, boolean> = {};
  if (body.showPnl !== undefined) data.showPnl = Boolean(body.showPnl);
  if (body.showPayouts !== undefined) data.showPayouts = Boolean(body.showPayouts);
  if (body.showPositions !== undefined) data.showPositions = Boolean(body.showPositions);
  if (body.showDeposits !== undefined) data.showDeposits = Boolean(body.showDeposits);

  const settings = await prisma.userSettings.upsert({
    where: { userId: jwt.userId },
    create: { userId: jwt.userId, ...data },
    update: data,
  });
  return NextResponse.json(settings);
}
