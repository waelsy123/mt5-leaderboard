# MT5 Trading Leaderboard

A trading leaderboard platform that tracks MetaTrader 5 performance. Users register, link their MT5 accounts, and optionally share PNL, deposits, payouts, and open positions on a public leaderboard.

## Architecture

```
                               ┌──────────────────────┐
                               │       Users          │
                               │   (Browser / Mobile) │
                               └──────────┬───────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MT5 Leaderboard (this repo)                  │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Frontend    │  │  API Routes  │  │  Background Sync       │ │
│  │             │  │              │  │                        │ │
│  │  /leaderboard│  │  /api/auth/* │  │  Every 5 min:          │ │
│  │  /dashboard  │  │  /api/me/*   │  │  - Pull account data   │ │
│  │  /settings   │  │  /api/leader │  │  - Fetch closed deals  │ │
│  │  /u/:id      │  │  /api/users/*│  │  - Compute PNL & ROI   │ │
│  │  /login      │  │  /api/sync   │  │  - Create snapshots    │ │
│  │  /register   │  │              │  │  - Cleanup old data    │ │
│  └─────────────┘  └──────┬───────┘  └───────────┬────────────┘ │
│                          │                       │              │
│                          ▼                       │              │
│                 ┌─────────────────┐              │              │
│                 │   PostgreSQL    │              │              │
│                 │                 │              │              │
│                 │  Users          │              │              │
│                 │  UserSettings   │              │              │
│                 │  LinkedAccounts │              │              │
│                 │  Deals          │              │              │
│                 │  PnlSnapshots   │              │              │
│                 └─────────────────┘              │              │
└──────────────────────────────────────────────────┼──────────────┘
                                                   │
                                      HTTP + X-Api-Key header
                                                   │
                                                   ▼
                              ┌─────────────────────────────────┐
                              │   MT5 Fleet Orchestrator         │
                              │   (separate service, read-only)  │
                              │                                  │
                              │   Provides:                      │
                              │   - Live balance / equity / PNL  │
                              │   - Open positions per account   │
                              │   - Closed deal history          │
                              │   - Historical snapshots (60d)   │
                              │                                  │
                              │   Manages:                       │
                              │   - Windows VPS fleet            │
                              │   - MetaTrader 5 terminals       │
                              │   - Copy trading engine          │
                              └─────────────────────────────────┘
```

### Data Flow

1. **User registers** and links their MT5 account by providing `server` + `login`
2. **Background sync** (every 5 min) calls the Fleet Orchestrator to pull:
   - Account balance/equity from `GET /api/accounts`
   - Closed deals from `GET /api/accounts/{vpsId}/{server}/{login}/deals`
3. **Deals are upserted** by `dealTicket` (deduplicated) into the local database
4. **Realized PNL** is computed: `SUM(profit + swap + commission)` for all `entry=OUT` deals
5. **Deposits/withdrawals** are auto-detected from deals with `type=BALANCE`
6. **ROI** is calculated: `realizedPnl / totalDeposits * 100`
7. **PNL snapshots** are stored for equity curve charts
8. **Leaderboard** ranks users by aggregated metrics across all their linked accounts

### Key Design Decisions

- **Separate service** — decoupled from the orchestrator to isolate user-facing product from trading infrastructure
- **Read-only consumer** — this service never executes trades or modifies VPS config
- **Privacy-first** — all data is private by default; users explicitly opt in to sharing each data category
- **Backend proxy** — the frontend never calls the orchestrator directly; all data flows through this backend
- **Automatic PNL** — no manual bookkeeping; deposits, withdrawals, and realized PNL are computed from MT5 deal history

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Styling | Tailwind CSS v4 |
| Background Jobs | node-cron via instrumentation.ts |
| Deployment | Railway (Docker) |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts    POST — create user account
│   │   │   ├── login/route.ts       POST — authenticate, set JWT cookie
│   │   │   └── logout/route.ts      POST — clear cookie
│   │   ├── me/
│   │   │   ├── route.ts             GET — current user profile + accounts
│   │   │   ├── settings/route.ts    PATCH — update privacy toggles
│   │   │   └── accounts/
│   │   │       ├── route.ts         GET — list linked accounts
│   │   │       │                    POST — link new MT5 account
│   │   │       └── [id]/
│   │   │           ├── route.ts     DELETE — unlink account
│   │   │           ├── deals/       GET — closed trade history
│   │   │           └── positions/   GET — live open positions (proxied)
│   │   ├── leaderboard/route.ts     GET — public rankings (no auth)
│   │   ├── users/[id]/
│   │   │   ├── profile/route.ts     GET — public profile (no auth)
│   │   │   └── equity-curve/route.ts GET — equity chart data (no auth)
│   │   ├── sync/route.ts            POST — trigger manual sync (secret)
│   │   └── health/route.ts          GET — liveness check
│   ├── page.tsx                     Landing page
│   ├── login/page.tsx               Login form
│   ├── register/page.tsx            Registration form
│   ├── dashboard/
│   │   ├── page.tsx                 User dashboard + link account form
│   │   └── accounts/[id]/page.tsx   Account detail (deals + positions)
│   ├── leaderboard/page.tsx         Public leaderboard table
│   ├── settings/page.tsx            Privacy toggle switches
│   └── u/[id]/page.tsx              Public user profile
├── lib/
│   ├── auth.ts                      JWT sign/verify, bcrypt, cookie helpers
│   ├── orchestrator.ts              HTTP client for Fleet Orchestrator API
│   ├── prisma.ts                    Prisma singleton
│   └── sync.ts                      Background sync + PNL computation logic
├── middleware.ts                    Public vs protected route guard
└── instrumentation.ts              Cron: sync every 5min, cleanup daily
```

## Database Schema

```
User
├── id, email, passwordHash, displayName, avatarUrl
├── createdAt, updatedAt
├── settings → UserSettings (1:1)
└── accounts → LinkedAccount[] (1:N)

UserSettings
├── showPnl, showPayouts, showPositions, showDeposits
└── (all default false — private by default)

LinkedAccount
├── userId, orchestratorAccountId, vpsId, server, login, broker
├── balance, equity, unrealizedPnl, realizedPnl
├── totalDeposits, totalWithdrawals, roi
├── lastSyncedAt
├── deals → Deal[] (1:N)
└── snapshots → PnlSnapshot[] (1:N)

Deal
├── dealTicket (unique — deduplication key)
├── symbol, type, entry, volume, price
├── profit, swap, commission
├── positionId, closedAt
└── type: BUY | SELL | BALANCE | CREDIT | COMMISSION

PnlSnapshot
├── balance, equity, realizedPnl, unrealizedPnl
└── timestamp (indexed for time-series queries)
```

## Local Development

```bash
# Install dependencies
npm install

# Copy and fill environment variables
cp .env.example .env

# Push schema to local database
npx prisma db push

# Start dev server
npm run dev

# Run a manual sync
npm run sync
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ORCHESTRATOR_URL` | Yes | MT5 Fleet Orchestrator base URL |
| `ORCHESTRATOR_API_KEY` | Yes | API key for orchestrator (`X-Api-Key` header) |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens (`openssl rand -hex 32`) |
| `SYNC_SECRET` | No | Secret for `POST /api/sync` manual trigger (defaults to `JWT_SECRET`) |

## Deployment (Railway)

### Prerequisites

- A running **MT5 Fleet Orchestrator** service with `VPS_API_KEY` configured
- A Railway account with the `mt5-fleet-orchestrator` project

### Step-by-step

1. **Create a new service** in the Railway project:
   ```
   Railway Dashboard → mt5-fleet-orchestrator project → + New Service → GitHub Repo
   ```
   Select the `waelsy123/mt5-leaderboard` repository.

2. **Add a PostgreSQL database**:
   ```
   + New Service → Database → PostgreSQL
   ```
   Railway auto-injects `DATABASE_URL` into the service.

3. **Set environment variables** on the leaderboard service:
   ```
   ORCHESTRATOR_URL=https://mt5-fleet-orchestrator-production.up.railway.app
   ORCHESTRATOR_API_KEY=<same value as VPS_API_KEY from orchestrator>
   JWT_SECRET=<generate with: openssl rand -hex 32>
   ```

4. **Deploy** — Railway auto-builds from Dockerfile and runs:
   ```
   prisma migrate deploy → npm start
   ```

5. **Generate a domain**:
   ```
   Service Settings → Networking → Generate Domain
   ```

### Railway Project Layout

```
Railway Project: mt5-fleet-orchestrator
│
├── Service: mt5-fleet-orch              ← orchestrator (existing)
│   └── PostgreSQL: fleet database       ← VPS, accounts, snapshots
│
├── Service: mt5-leaderboard             ← this service (new)
│   └── PostgreSQL: leaderboard database ← users, deals, PNL data
│
└── (services share private network for fast internal communication)
```

### Health Check

The Dockerfile exposes `/api/health` which Railway uses for health checks. The service is considered healthy when this endpoint returns `200 OK`.

### Manual Sync

Trigger a one-off sync outside the 5-minute cron:

```bash
curl -X POST https://<your-domain>/api/sync \
  -H "x-sync-secret: <your-JWT_SECRET>"
```

### Monitoring

- **Sync logs** — visible in Railway service logs, prefixed with `[sync]` and `[cron]`
- **Sync frequency** — every 5 minutes via node-cron
- **Snapshot retention** — 90 days (cleaned up daily at 3am)
