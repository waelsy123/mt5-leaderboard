"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Entry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  totalRealizedPnl: number;
  totalUnrealizedPnl: number;
  totalEquity: number;
  roi: number;
  accountCount: number;
  totalCashback?: number;
  totalTrades?: number;
}

const timeFilters = ["All Time", "This Month", "This Week"] as const;
const sortOptions = [
  { value: "realizedPnl", label: "Realized PNL" },
  { value: "roi", label: "ROI %" },
  { value: "totalEquity", label: "Equity" },
] as const;

function rankBadge(rank: number) {
  if (rank === 1) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  if (rank === 2) return "bg-zinc-400/20 text-zinc-300 border-zinc-400/30";
  if (rank === 3) return "bg-amber-600/20 text-amber-400 border-amber-600/30";
  return "bg-zinc-800 text-zinc-500 border-zinc-700";
}

function rankMedal(rank: number): string {
  if (rank === 1) return "\uD83E\uDD47";
  if (rank === 2) return "\uD83E\uDD48";
  if (rank === 3) return "\uD83E\uDD49";
  return "";
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sort, setSort] = useState("realizedPnl");
  const [timeFilter, setTimeFilter] = useState<string>("All Time");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?sort=${sort}&limit=50`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data);
        setLastUpdated(new Date());
      })
      .finally(() => setLoading(false));
  }, [sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white">Live Leaderboard</h1>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-glow" />
            <span className="text-xs font-medium text-green-400">Live</span>
          </span>
        </div>
        {lastUpdated && (
          <p className="text-sm text-zinc-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Time filter tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          {timeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === filter
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-500">Sort by:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white appearance-none cursor-pointer hover:border-zinc-700 transition-colors focus:outline-none focus:border-blue-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-zinc-900/50 border border-zinc-800/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">
            No traders yet
          </h3>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto">
            Be the first to share your PNL and claim the top spot on the
            leaderboard.
          </p>
          <Link
            href="/register"
            className="inline-flex mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Create Account
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-4 text-left w-16">#</th>
                  <th className="px-5 py-4 text-left">Trader</th>
                  <th className="px-5 py-4 text-center">Accounts</th>
                  <th className="px-5 py-4 text-right">Realized PNL</th>
                  <th className="px-5 py-4 text-right">Unrealized PNL</th>
                  <th className="px-5 py-4 text-right">ROI %</th>
                  <th className="px-5 py-4 text-right">Total Equity</th>
                  <th className="px-5 py-4 text-right">Cashback Earned</th>
                  <th className="px-5 py-4 text-right">Total Trades</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {entries.map((e) => (
                  <tr
                    key={e.userId}
                    className="hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border ${rankBadge(
                          e.rank
                        )}`}
                      >
                        {rankMedal(e.rank) || e.rank}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/u/${e.userId}`}
                        className="flex items-center gap-3 group"
                      >
                        {e.avatarUrl ? (
                          <img
                            src={e.avatarUrl}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-sm font-semibold">
                            {e.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-zinc-200 group-hover:text-blue-400 transition-colors">
                          {e.displayName}
                          {e.rank <= 10 && (
                            <svg className="w-4 h-4 text-blue-400 inline ml-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm text-zinc-400 font-mono">
                        {e.accountCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`font-mono text-sm font-medium ${
                          e.totalRealizedPnl >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {e.totalRealizedPnl >= 0 ? "+" : ""}$
                        {Math.abs(e.totalRealizedPnl).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`font-mono text-sm ${
                          e.totalUnrealizedPnl >= 0
                            ? "text-green-400/70"
                            : "text-red-400/70"
                        }`}
                      >
                        {e.totalUnrealizedPnl >= 0 ? "+" : ""}$
                        {Math.abs(e.totalUnrealizedPnl).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`font-mono text-sm font-medium ${
                          e.roi >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {e.roi >= 0 ? "+" : ""}
                        {e.roi.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-mono text-sm text-zinc-300">
                        $
                        {e.totalEquity.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-mono text-sm text-green-400">
                        {e.totalCashback != null && e.totalCashback > 0
                          ? `$${e.totalCashback.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "\u2014"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-mono text-sm text-zinc-400">
                        {e.totalTrades != null ? e.totalTrades.toLocaleString() : "\u2014"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {entries.map((e) => (
              <Link
                key={e.userId}
                href={`/u/${e.userId}`}
                className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold border ${rankBadge(
                        e.rank
                      )}`}
                    >
                      {rankMedal(e.rank) || e.rank}
                    </span>
                    {e.avatarUrl ? (
                      <img
                        src={e.avatarUrl}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-semibold">
                        {e.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-zinc-200 text-sm">
                      {e.displayName}
                      {e.rank <= 10 && (
                        <svg className="w-4 h-4 text-blue-400 inline ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-sm font-bold ${
                      e.totalRealizedPnl >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {e.totalRealizedPnl >= 0 ? "+" : ""}$
                    {Math.abs(e.totalRealizedPnl).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase">ROI</p>
                    <p
                      className={`font-mono text-xs font-medium ${
                        e.roi >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {e.roi >= 0 ? "+" : ""}
                      {e.roi.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase">
                      Equity
                    </p>
                    <p className="font-mono text-xs text-zinc-300">
                      ${e.totalEquity.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase">
                      Accounts
                    </p>
                    <p className="font-mono text-xs text-zinc-400">
                      {e.accountCount}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Join Now CTA */}
          <div className="mt-10 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-zinc-800 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Want to see your name here?</h3>
            <p className="text-zinc-400 text-sm mb-4">Join ProofTrades, link your MT5 account, and start climbing the leaderboard.</p>
            <a href="/register" className="inline-flex px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
              Create Free Account
            </a>
          </div>
        </>
      )}
    </div>
  );
}
