import { NextRequest, NextResponse } from "next/server";
import { syncAllAccounts, cleanupSnapshots } from "@/lib/sync";

// Trigger sync via API (called by cron or manually)
// Protected by a sync secret to prevent abuse
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-sync-secret");
  const expected = process.env.SYNC_SECRET || process.env.JWT_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await syncAllAccounts();
    await cleanupSnapshots();
    return NextResponse.json({ ok: true, syncedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[sync] Error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
