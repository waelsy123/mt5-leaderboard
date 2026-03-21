import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const jwt = await getUser();
  if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: jwt.userId },
    include: { settings: true, accounts: { orderBy: { createdAt: "desc" } } },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { passwordHash: _, ...safe } = user;
  return NextResponse.json(safe);
}
