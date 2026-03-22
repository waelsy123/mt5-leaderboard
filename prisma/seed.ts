import { PrismaClient, ChallengeStatus, CashbackStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Cashback lookup: accountSize -> { fee, cashback (20% of fee) }
const CASHBACK_TABLE: Record<number, { fee: number; cashback: number }> = {
  10000: { fee: 100, cashback: 20 },
  25000: { fee: 200, cashback: 40 },
  50000: { fee: 300, cashback: 60 },
  100000: { fee: 500, cashback: 100 },
};

const BROKERS = ["FTMO", "AquaFunded", "The5%ers", "MyFundedFX", "Funded Next"];
const CHALLENGE_TYPES = ["Phase 1", "Phase 2", "Funded", "Evaluation"];
const ACCOUNT_SIZES = [10000, 25000, 50000, 100000];
const SERVERS = [
  "FTMO-Server",
  "AquaFunded-Live",
  "The5ers-MT5",
  "MyFundedFX-Live",
  "FundedNext-Server",
  "ICMarkets-Live01",
  "Pepperstone-MT5",
];

const USERS = [
  { displayName: "AlphaFX_Pro", email: "alphafx@example.com" },
  { displayName: "Sarah_Trades", email: "sarah@example.com" },
  { displayName: "Tokyo_Scalper", email: "tokyo@example.com" },
  { displayName: "GoldBull_Mike", email: "mike@example.com" },
  { displayName: "LondonPips", email: "londonpips@example.com" },
  { displayName: "NasDaq_Queen", email: "nasdaq@example.com" },
  { displayName: "SwingKing_DZ", email: "swingking@example.com" },
  { displayName: "FX_Warrior99", email: "warrior99@example.com" },
  { displayName: "Pip_Hunter_Ali", email: "ali@example.com" },
  { displayName: "CryptoFX_Jade", email: "jade@example.com" },
  { displayName: "Samurai_Trader", email: "samurai@example.com" },
  { displayName: "EuroSniper", email: "eurosniper@example.com" },
  { displayName: "Mama_Pips", email: "mamapips@example.com" },
  { displayName: "DayTrade_Dan", email: "dan@example.com" },
  { displayName: "SydneyFX_Boss", email: "sydney@example.com" },
  { displayName: "ScalpMaster_K", email: "scalpmaster@example.com" },
  { displayName: "ProfitPanda", email: "panda@example.com" },
  { displayName: "RiskManager_J", email: "riskj@example.com" },
  { displayName: "NYSession_Pro", email: "nysession@example.com" },
  { displayName: "ZuluFX_Trader", email: "zulu@example.com" },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  console.log("Cleaning existing data...");
  await prisma.challenge.deleteMany();
  await prisma.pnlSnapshot.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.linkedAccount.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo123", 12);

  console.log("Seeding 20 users with accounts, settings, and challenges...");

  for (let i = 0; i < USERS.length; i++) {
    const { displayName, email } = USERS[i];

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
      },
    });

    // Create UserSettings with showPnl=true
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        showPnl: true,
        showPayouts: Math.random() > 0.5,
        showPositions: Math.random() > 0.5,
        showDeposits: Math.random() > 0.3,
      },
    });

    // Create 1-3 linked accounts
    const numAccounts = randInt(1, 3);
    const accountIds: string[] = [];

    for (let a = 0; a < numAccounts; a++) {
      const server = pick(SERVERS);
      const login = String(100000 + i * 100 + a);
      const balance = randBetween(5000, 250000);
      const realizedPnl = randBetween(-5000, 30000);
      const unrealizedPnl = randBetween(-2000, 5000);
      const equity = balance + unrealizedPnl;
      const totalDeposits = randBetween(balance * 0.8, balance * 1.2);
      const roi = randBetween(-10, 45);

      const account = await prisma.linkedAccount.create({
        data: {
          userId: user.id,
          orchestratorAccountId: `orch_${user.id}_${a}`,
          vpsId: `vps_${randInt(1, 5)}`,
          server,
          login,
          broker: pick(BROKERS),
          balance,
          equity,
          unrealizedPnl,
          realizedPnl,
          totalDeposits,
          totalWithdrawals: randBetween(0, totalDeposits * 0.3),
          roi,
          lastSyncedAt: new Date(),
        },
      });
      accountIds.push(account.id);
    }

    // Create 1-4 challenges per user
    const numChallenges = randInt(1, 4);

    for (let c = 0; c < numChallenges; c++) {
      const broker = pick(BROKERS);
      const challengeType = pick(CHALLENGE_TYPES);
      const accountSize = pick(ACCOUNT_SIZES);
      const { cashback } = CASHBACK_TABLE[accountSize];
      const profitTarget = challengeType === "Phase 1" ? 8 : challengeType === "Phase 2" ? 5 : 10;
      const maxDrawdown = challengeType === "Funded" ? 5 : 10;
      const startBalance = accountSize;
      const startDaysAgo = randInt(5, 90);

      // Determine status distribution: ~40% active, ~50% completed, ~10% cancelled
      const statusRoll = Math.random();
      let status: ChallengeStatus;
      let result: string | null = null;
      let endDate: Date | null = null;
      let endBalance: number | null = null;
      let cashbackAmount = 0;
      let cashbackStatus: CashbackStatus = CashbackStatus.PENDING;
      let cashbackPaidAt: Date | null = null;

      if (statusRoll < 0.4) {
        // ACTIVE
        status = ChallengeStatus.ACTIVE;
        endBalance = null;
        cashbackAmount = 0;
        cashbackStatus = CashbackStatus.PENDING;
      } else if (statusRoll < 0.9) {
        // COMPLETED
        status = ChallengeStatus.COMPLETED;
        endDate = daysAgo(randInt(1, startDaysAgo - 1));

        // 60% passed, 30% failed, 10% breached
        const resultRoll = Math.random();
        if (resultRoll < 0.6) {
          result = "PASSED";
          endBalance = startBalance + startBalance * randBetween(profitTarget, profitTarget + 10) / 100;
          cashbackAmount = cashback;

          // Cashback status for passed: 40% PAID, 30% ELIGIBLE, 20% PROCESSING, 10% PENDING
          const cbRoll = Math.random();
          if (cbRoll < 0.4) {
            cashbackStatus = CashbackStatus.PAID;
            cashbackPaidAt = daysAgo(randInt(1, 10));
          } else if (cbRoll < 0.7) {
            cashbackStatus = CashbackStatus.ELIGIBLE;
          } else if (cbRoll < 0.9) {
            cashbackStatus = CashbackStatus.PROCESSING;
          } else {
            cashbackStatus = CashbackStatus.PENDING;
          }
        } else if (resultRoll < 0.9) {
          result = "FAILED";
          endBalance = startBalance - startBalance * randBetween(3, maxDrawdown) / 100;
          cashbackAmount = cashback;

          // Cashback for failed: 30% PAID, 30% ELIGIBLE, 20% PROCESSING, 20% PENDING
          const cbFailRoll = Math.random();
          if (cbFailRoll < 0.3) {
            cashbackStatus = CashbackStatus.PAID;
            cashbackPaidAt = daysAgo(randInt(1, 10));
          } else if (cbFailRoll < 0.6) {
            cashbackStatus = CashbackStatus.ELIGIBLE;
          } else if (cbFailRoll < 0.8) {
            cashbackStatus = CashbackStatus.PROCESSING;
          } else {
            cashbackStatus = CashbackStatus.PENDING;
          }
        } else {
          result = "BREACHED";
          endBalance = startBalance - startBalance * randBetween(maxDrawdown, maxDrawdown + 5) / 100;
          cashbackAmount = cashback;

          // Cashback for breached: 30% PAID, 30% ELIGIBLE, 20% PROCESSING, 20% PENDING
          const cbBreachRoll = Math.random();
          if (cbBreachRoll < 0.3) {
            cashbackStatus = CashbackStatus.PAID;
            cashbackPaidAt = daysAgo(randInt(1, 10));
          } else if (cbBreachRoll < 0.6) {
            cashbackStatus = CashbackStatus.ELIGIBLE;
          } else if (cbBreachRoll < 0.8) {
            cashbackStatus = CashbackStatus.PROCESSING;
          } else {
            cashbackStatus = CashbackStatus.PENDING;
          }
        }
      } else {
        // CANCELLED
        status = ChallengeStatus.CANCELLED;
        endDate = daysAgo(randInt(1, startDaysAgo - 1));
        cashbackAmount = 0;
        cashbackStatus = CashbackStatus.REJECTED;
      }

      const walletAddress =
        cashbackStatus === CashbackStatus.PAID || cashbackStatus === CashbackStatus.ELIGIBLE || cashbackStatus === CashbackStatus.PROCESSING
          ? `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
          : null;

      await prisma.challenge.create({
        data: {
          userId: user.id,
          accountId: accountIds.length > 0 ? pick(accountIds) : null,
          broker,
          challengeType,
          accountSize,
          status,
          result,
          startDate: daysAgo(startDaysAgo),
          endDate,
          startBalance,
          endBalance,
          profitTarget,
          maxDrawdown,
          cashbackAmount,
          cashbackStatus,
          cashbackPaidAt,
          walletAddress,
        },
      });
    }

    console.log(`  Created user ${i + 1}/20: ${displayName} (${numAccounts} accounts, ${numChallenges} challenges)`);
  }

  // Print summary
  const userCount = await prisma.user.count();
  const accountCount = await prisma.linkedAccount.count();
  const challengeCount = await prisma.challenge.count();
  const paidCashback = await prisma.challenge.aggregate({
    _sum: { cashbackAmount: true },
    where: { cashbackStatus: CashbackStatus.PAID },
  });

  console.log("\nSeed complete!");
  console.log(`  Users: ${userCount}`);
  console.log(`  Linked Accounts: ${accountCount}`);
  console.log(`  Challenges: ${challengeCount}`);
  console.log(`  Total Cashback Paid: $${paidCashback._sum.cashbackAmount?.toFixed(2) ?? "0.00"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
