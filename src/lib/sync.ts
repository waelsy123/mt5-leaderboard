import { prisma } from "./prisma";
import { fetchAccounts, fetchDeals } from "./orchestrator";

export async function syncAllAccounts() {
  const accounts = await prisma.linkedAccount.findMany();
  if (accounts.length === 0) return;

  // Fetch latest data from orchestrator
  let orchAccounts;
  try {
    orchAccounts = await fetchAccounts();
  } catch (err) {
    console.error("[sync] Failed to fetch orchestrator accounts:", err);
    return;
  }

  const orchMap = new Map(orchAccounts.map((a) => [`${a.server}/${a.login}`, a]));

  for (const account of accounts) {
    const key = `${account.server}/${account.login}`;
    const orch = orchMap.get(key);
    if (!orch) continue;

    try {
      // Update balance/equity from orchestrator
      const unrealizedPnl = orch.equity - orch.balance;

      // Sync deals (last 7 days to catch recent closes)
      let realizedPnl = account.realizedPnl;
      let totalDeposits = account.totalDeposits;
      let totalWithdrawals = account.totalWithdrawals;

      try {
        const { deals } = await fetchDeals(account.vpsId, account.server, account.login, 7);
        for (const deal of deals) {
          if (deal.deal === 0) continue;
          await prisma.deal.upsert({
            where: { dealTicket: BigInt(deal.deal) },
            create: {
              accountId: account.id,
              dealTicket: BigInt(deal.deal),
              orderTicket: deal.order ? BigInt(deal.order) : null,
              symbol: deal.symbol,
              type: deal.type,
              entry: deal.entry,
              volume: deal.volume,
              price: deal.price,
              profit: deal.profit,
              swap: deal.swap,
              commission: deal.commission,
              comment: deal.comment,
              positionId: deal.positionId ? BigInt(deal.positionId) : null,
              closedAt: new Date(deal.time * 1000),
            },
            update: {},
          });
        }
      } catch (err) {
        console.error(`[sync] Failed to fetch deals for ${key}:`, err);
      }

      // Recompute aggregates from all stored deals
      const aggregates = await prisma.deal.groupBy({
        by: ["type", "entry"],
        where: { accountId: account.id },
        _sum: { profit: true, swap: true, commission: true },
      });

      realizedPnl = 0;
      totalDeposits = 0;
      totalWithdrawals = 0;

      for (const agg of aggregates) {
        const profit = agg._sum.profit || 0;
        const swap = agg._sum.swap || 0;
        const commission = agg._sum.commission || 0;

        if (agg.entry === "OUT") {
          realizedPnl += profit + swap + commission;
        }
        if (agg.type === "BALANCE") {
          if (profit > 0) totalDeposits += profit;
          else totalWithdrawals += Math.abs(profit);
        }
      }

      const roi = totalDeposits > 0 ? (realizedPnl / totalDeposits) * 100 : 0;

      await prisma.linkedAccount.update({
        where: { id: account.id },
        data: {
          balance: orch.balance,
          equity: orch.equity,
          unrealizedPnl,
          realizedPnl: Math.round(realizedPnl * 100) / 100,
          totalDeposits: Math.round(totalDeposits * 100) / 100,
          totalWithdrawals: Math.round(totalWithdrawals * 100) / 100,
          roi: Math.round(roi * 100) / 100,
          lastSyncedAt: new Date(),
        },
      });

      // Create PNL snapshot for equity curve
      await prisma.pnlSnapshot.create({
        data: {
          accountId: account.id,
          balance: orch.balance,
          equity: orch.equity,
          realizedPnl: Math.round(realizedPnl * 100) / 100,
          unrealizedPnl: Math.round(unrealizedPnl * 100) / 100,
        },
      });

      console.log(`[sync] ${key}: bal=${orch.balance} eq=${orch.equity} realized=${realizedPnl.toFixed(2)} roi=${roi.toFixed(1)}%`);
    } catch (err) {
      console.error(`[sync] Error syncing ${key}:`, err);
    }
  }
}

// Clean up old snapshots (keep 90 days)
export async function cleanupSnapshots() {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const { count } = await prisma.pnlSnapshot.deleteMany({
    where: { timestamp: { lt: cutoff } },
  });
  if (count > 0) console.log(`[sync] Cleaned up ${count} old snapshots`);
}

// Run standalone
if (require.main === module) {
  (async () => {
    console.log("[sync] Starting manual sync...");
    await syncAllAccounts();
    await cleanupSnapshots();
    console.log("[sync] Done.");
    process.exit(0);
  })();
}
