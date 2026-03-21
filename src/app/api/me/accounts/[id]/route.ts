import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function DELETE(
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

  await prisma.linkedAccount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
