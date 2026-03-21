export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = await import("node-cron");
    const { syncAllAccounts, cleanupSnapshots } = await import("./lib/sync");

    // Sync every 5 minutes
    cron.default.schedule("*/5 * * * *", async () => {
      console.log("[cron] Running sync...");
      try {
        await syncAllAccounts();
      } catch (err) {
        console.error("[cron] Sync failed:", err);
      }
    });

    // Cleanup old snapshots daily at 3am
    cron.default.schedule("0 3 * * *", async () => {
      try {
        await cleanupSnapshots();
      } catch (err) {
        console.error("[cron] Cleanup failed:", err);
      }
    });

    console.log("[cron] Sync scheduled every 5 minutes");
  }
}
