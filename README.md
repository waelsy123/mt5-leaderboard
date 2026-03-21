# MT5 Trading Leaderboard

A trading leaderboard platform that tracks MetaTrader 5 performance. Users register, link their MT5 accounts, and optionally share PNL, deposits, payouts, and open positions on a public leaderboard.

## Architecture

- **This service** — Next.js frontend + API, user auth, leaderboard rankings
- **MT5 Fleet Orchestrator** — upstream data source for live trading data (read-only)

## Setup

```bash
npm install
cp .env.example .env  # fill in values
npx prisma db push
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ORCHESTRATOR_URL` | Yes | MT5 Fleet Orchestrator base URL |
| `ORCHESTRATOR_API_KEY` | Yes | API key for orchestrator |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `SYNC_SECRET` | No | Secret for triggering manual sync |

## Background Sync

The app automatically syncs account data from the orchestrator every 5 minutes via `node-cron` in `src/instrumentation.ts`. You can also trigger a manual sync:

```bash
curl -X POST http://localhost:3000/api/sync -H "x-sync-secret: YOUR_JWT_SECRET"
```

## Deploy to Railway

1. Create a new service in the `mt5-fleet-orchestrator` Railway project
2. Connect this repo
3. Add a PostgreSQL database
4. Set environment variables
5. Deploy
