"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Deal {
  id: string;
  symbol: string;
  type: string;
  entry: string;
  volume: number;
  price: number;
  profit: number;
  swap: number;
  commission: number;
  closedAt: string;
}

interface Position {
  ticket: string;
  symbol: string;
  type: string;
  volume: number;
  openPrice: number;
  profit: number;
}

export default function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tab, setTab] = useState<"deals" | "positions">("deals");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/me/accounts/${id}/deals?limit=200`).then((r) => r.json()),
      fetch(`/api/me/accounts/${id}/positions`).then((r) => r.json()),
    ]).then(([d, p]) => {
      setDeals(Array.isArray(d) ? d : []);
      setPositions(Array.isArray(p) ? p : []);
      setLoading(false);
    });
  }, [id]);

  const totalProfit = deals.reduce((s, d) => s + d.profit, 0);
  const winCount = deals.filter((d) => d.profit > 0).length;
  const winRate = deals.length > 0 ? (winCount / deals.length) * 100 : 0;
  const unrealizedPnl = positions.reduce((s, p) => s + p.profit, 0);

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4 animate-pulse">
          <div className="w-48 h-8 bg-zinc-800 rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-zinc-900/50 rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-zinc-900/50 rounded-2xl" />
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <Link
          href="/dashboard"
          className="hover:text-zinc-300 transition-colors"
        >
          Dashboard
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-zinc-300">Account Details</span>
      </div>

      <h1 className="text-2xl font-bold text-white mb-6">Account Details</h1>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
            Total Trades
          </p>
          <p className="text-xl font-bold font-mono text-white">
            {deals.length}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
            Realized PNL
          </p>
          <p
            className={`text-xl font-bold font-mono ${
              totalProfit >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
            Win Rate
          </p>
          <p className="text-xl font-bold font-mono text-white">
            {winRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
            Unrealized
          </p>
          <p
            className={`text-xl font-bold font-mono ${
              unrealizedPnl >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => setTab("deals")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "deals"
              ? "bg-zinc-800 text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Trade History ({deals.length})
        </button>
        <button
          onClick={() => setTab("positions")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "positions"
              ? "bg-zinc-800 text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Open Positions ({positions.length})
        </button>
      </div>

      {/* Deals table */}
      {tab === "deals" && (
        <div className="rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Symbol</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Entry</th>
                  <th className="px-4 py-3 text-right">Volume</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {deals.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-zinc-500 text-xs font-mono">
                      {new Date(d.closedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-200">
                      {d.symbol || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${
                          d.type.toLowerCase().includes("buy")
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {d.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {d.entry}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-300">
                      {d.volume}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-300">
                      {d.price}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-medium ${
                        d.profit >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {d.profit >= 0 ? "+" : ""}${d.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {deals.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-zinc-500"
                    >
                      No trades recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Positions table */}
      {tab === "positions" && (
        <div className="rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Ticket</th>
                  <th className="px-4 py-3 text-left">Symbol</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Volume</th>
                  <th className="px-4 py-3 text-right">Open Price</th>
                  <th className="px-4 py-3 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {positions.map((p) => (
                  <tr
                    key={p.ticket}
                    className="hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-zinc-500 text-xs">
                      {p.ticket}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-200">
                      {p.symbol}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${
                          p.type.toLowerCase().includes("buy")
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-300">
                      {p.volume}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-300">
                      {p.openPrice}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-medium ${
                        p.profit >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {p.profit >= 0 ? "+" : ""}${p.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {positions.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-zinc-500"
                    >
                      No open positions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
