"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Account {
  id: string;
  server: string;
  login: string;
  broker: string | null;
  balance: number;
  equity: number;
  realizedPnl: number;
  unrealizedPnl: number;
  roi: number;
  lastSyncedAt: string | null;
}

interface Challenge {
  id: string;
  broker: string;
  challengeType: string;
  accountSize: number;
  status: string;
  result: string | null;
  startDate: string;
  profitTarget: number;
  maxDrawdown: number;
  startBalance: number;
  endBalance: number | null;
  cashbackAmount: number;
  cashbackStatus: string;
}

interface UserData {
  displayName: string;
  avatarUrl: string | null;
  challenges?: Challenge[];
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkForm, setLinkForm] = useState({ server: "", login: "" });
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState("");
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    broker: "",
    challengeType: "Phase 1",
    accountSize: "50000",
    profitTarget: "8",
    maxDrawdown: "5",
  });
  const [addingChallenge, setAddingChallenge] = useState(false);

  async function fetchAccounts() {
    const res = await fetch("/api/me/accounts");
    if (res.ok) setAccounts(await res.json());
  }

  async function fetchUser() {
    const res = await fetch("/api/me");
    if (res.ok) {
      const data = await res.json();
      setUser(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAccounts();
    fetchUser();
  }, []);

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLinking(true);
    try {
      const res = await fetch("/api/me/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setLinkForm({ server: "", login: "" });
      fetchAccounts();
    } catch {
      setError("Network error");
    } finally {
      setLinking(false);
    }
  }

  async function handleUnlink(id: string) {
    if (!confirm("Unlink this account? This will remove it from your dashboard.")) return;
    await fetch(`/api/me/accounts/${id}`, { method: "DELETE" });
    fetchAccounts();
  }

  async function handleAddChallenge(e: React.FormEvent) {
    e.preventDefault();
    setAddingChallenge(true);
    try {
      const res = await fetch("/api/me/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          broker: challengeForm.broker,
          challengeType: challengeForm.challengeType,
          accountSize: parseFloat(challengeForm.accountSize),
          profitTarget: parseFloat(challengeForm.profitTarget),
          maxDrawdown: parseFloat(challengeForm.maxDrawdown),
          startBalance: parseFloat(challengeForm.accountSize),
        }),
      });
      if (res.ok) {
        setShowChallengeForm(false);
        setChallengeForm({
          broker: "",
          challengeType: "Phase 1",
          accountSize: "50000",
          profitTarget: "8",
          maxDrawdown: "5",
        });
        fetchUser();
      }
    } catch {
      // Ignore
    } finally {
      setAddingChallenge(false);
    }
  }

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalEquity = accounts.reduce((s, a) => s + a.equity, 0);
  const totalRealized = accounts.reduce((s, a) => s + a.realizedPnl, 0);
  const totalCashback =
    user?.challenges?.reduce((s, c) => s + c.cashbackAmount, 0) ?? 0;

  const challenges = user?.challenges ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-500 mt-1">
          Overview of your trading accounts and challenges.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <SummaryCard label="Total Balance" value={totalBalance} prefix="$" />
        <SummaryCard label="Total Equity" value={totalEquity} prefix="$" />
        <SummaryCard
          label="Realized PNL"
          value={totalRealized}
          prefix="$"
          colored
        />
        <SummaryCard
          label="Cashback Earned"
          value={totalCashback}
          prefix="$"
          suffix=" USDT"
          positive
        />
      </div>

      {/* Linked Accounts */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Linked Accounts</h2>
          <span className="text-sm text-zinc-500">
            {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <p className="text-zinc-400 text-sm">
              No accounts linked yet. Add one below to start tracking.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((a) => (
              <div
                key={a.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/accounts/${a.id}`}
                        className="font-medium text-zinc-200 hover:text-blue-400 transition-colors"
                      >
                        {a.login}@{a.server}
                      </Link>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {a.broker || "Unknown broker"}
                        {a.lastSyncedAt && (
                          <span className="ml-2 text-zinc-600">
                            Synced{" "}
                            {new Date(a.lastSyncedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 sm:gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 uppercase">
                        Balance
                      </p>
                      <p className="font-mono text-sm text-zinc-200">
                        $
                        {a.balance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 uppercase">
                        PNL
                      </p>
                      <p
                        className={`font-mono text-sm font-medium ${
                          a.realizedPnl >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {a.realizedPnl >= 0 ? "+" : ""}$
                        {Math.abs(a.realizedPnl).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 uppercase">
                        ROI
                      </p>
                      <p
                        className={`font-mono text-sm font-medium ${
                          a.roi >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {a.roi >= 0 ? "+" : ""}
                        {a.roi.toFixed(2)}%
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnlink(a.id)}
                      className="text-xs text-zinc-600 hover:text-red-400 transition-colors px-2 py-1"
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Link account form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-4">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">
            Link MT5 Challenge Account
          </h3>
          <form
            onSubmit={handleLink}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1">
              <label className="text-xs text-zinc-500 block mb-1.5">
                Server
              </label>
              <input
                value={linkForm.server}
                onChange={(e) =>
                  setLinkForm((p) => ({ ...p, server: e.target.value }))
                }
                placeholder="e.g. AquaFunded-Server"
                required
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="sm:w-44">
              <label className="text-xs text-zinc-500 block mb-1.5">
                Login
              </label>
              <input
                value={linkForm.login}
                onChange={(e) =>
                  setLinkForm((p) => ({ ...p, login: e.target.value }))
                }
                placeholder="e.g. 576984"
                required
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="sm:self-end">
              <button
                type="submit"
                disabled={linking}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {linking ? "Linking..." : "Link Account"}
              </button>
            </div>
          </form>
          <p className="text-xs text-zinc-500 mt-3">
            Enter your MT5 read-only credentials. We only track your trading performance — no trades will be executed on your account.
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Only MT5 accounts from supported prop firms can be linked.
          </p>
          {error && (
            <p className="text-red-400 text-sm mt-3 flex items-center gap-1.5">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </p>
          )}
        </div>
      </section>

      {/* Active Challenges */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            Active Challenges
          </h2>
          <button
            onClick={() => setShowChallengeForm(!showChallengeForm)}
            className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-xl transition-colors"
          >
            {showChallengeForm ? "Cancel" : "+ Add Challenge"}
          </button>
        </div>

        {/* Challenge form */}
        {showChallengeForm && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">
              New Challenge
            </h3>
            <form
              onSubmit={handleAddChallenge}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">
                  Broker / Prop Firm
                </label>
                <input
                  value={challengeForm.broker}
                  onChange={(e) =>
                    setChallengeForm((p) => ({
                      ...p,
                      broker: e.target.value,
                    }))
                  }
                  placeholder="e.g. FTMO"
                  required
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">
                  Challenge Type
                </label>
                <select
                  value={challengeForm.challengeType}
                  onChange={(e) =>
                    setChallengeForm((p) => ({
                      ...p,
                      challengeType: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option>Phase 1</option>
                  <option>Phase 2</option>
                  <option>Evaluation</option>
                  <option>Funded</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">
                  Account Size
                </label>
                <select
                  value={challengeForm.accountSize}
                  onChange={(e) =>
                    setChallengeForm((p) => ({
                      ...p,
                      accountSize: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="10000">$10,000</option>
                  <option value="25000">$25,000</option>
                  <option value="50000">$50,000</option>
                  <option value="100000">$100,000</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">
                  Profit Target (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={challengeForm.profitTarget}
                  onChange={(e) =>
                    setChallengeForm((p) => ({
                      ...p,
                      profitTarget: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">
                  Max Drawdown (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={challengeForm.maxDrawdown}
                  onChange={(e) =>
                    setChallengeForm((p) => ({
                      ...p,
                      maxDrawdown: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={addingChallenge}
                  className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {addingChallenge ? "Adding..." : "Add Challenge"}
                </button>
              </div>
            </form>
          </div>
        )}

        {challenges.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <p className="text-zinc-400 text-sm">
              No challenges yet. Track your prop firm challenges and earn
              cashback.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {challenges.map((ch) => {
              const currentPnl = ch.endBalance
                ? ch.endBalance - ch.startBalance
                : 0;
              const targetAmount =
                ch.startBalance * (ch.profitTarget / 100);
              const drawdownLimit =
                ch.startBalance * (ch.maxDrawdown / 100);
              const profitProgress = targetAmount > 0
                ? Math.min(
                    100,
                    Math.max(0, (currentPnl / targetAmount) * 100)
                  )
                : 0;
              const drawdownUsed = drawdownLimit > 0
                ? Math.min(
                    100,
                    Math.max(
                      0,
                      (Math.abs(Math.min(0, currentPnl)) / drawdownLimit) *
                        100
                    )
                  )
                : 0;

              return (
                <div
                  key={ch.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-zinc-200 text-sm">
                        {ch.broker}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {ch.challengeType} - $
                        {ch.accountSize.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        ch.status === "ACTIVE"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : ch.result === "PASSED"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {ch.status === "ACTIVE"
                        ? "Active"
                        : ch.result || "Completed"}
                    </span>
                  </div>

                  {/* Profit target progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-500">
                        Profit Target ({ch.profitTarget}%)
                      </span>
                      <span className="text-zinc-400 font-mono">
                        {profitProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${profitProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Drawdown used */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-500">
                        Drawdown Used ({ch.maxDrawdown}% max)
                      </span>
                      <span className="text-zinc-400 font-mono">
                        {drawdownUsed.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          drawdownUsed > 80
                            ? "bg-red-500"
                            : drawdownUsed > 50
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${drawdownUsed}%` }}
                      />
                    </div>
                  </div>

                  {/* Cashback */}
                  {ch.cashbackAmount > 0 && (
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-zinc-800">
                      <span className="text-zinc-500">Cashback</span>
                      <span className="font-mono font-medium text-green-400">
                        ${ch.cashbackAmount.toFixed(2)} USDT
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------- Summary Card ---------- */
function SummaryCard({
  label,
  value,
  prefix = "",
  suffix = "",
  colored = false,
  positive = false,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  colored?: boolean;
  positive?: boolean;
}) {
  let colorClass = "text-white";
  if (colored) {
    colorClass = value >= 0 ? "text-green-400" : "text-red-400";
  } else if (positive) {
    colorClass = "text-green-400";
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className={`text-2xl font-bold font-mono ${colorClass}`}>
        {colored && value >= 0 ? "+" : ""}
        {prefix}
        {Math.abs(value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        {suffix}
      </p>
    </div>
  );
}
