"use client";

import { useEffect, useState, use } from "react";

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

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (loading) return <p className="text-zinc-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Account Details</h1>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("deals")}
          className={`px-4 py-1.5 rounded-lg text-sm ${tab === "deals" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
        >
          Trade History ({deals.length})
        </button>
        <button
          onClick={() => setTab("positions")}
          className={`px-4 py-1.5 rounded-lg text-sm ${tab === "positions" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
        >
          Open Positions ({positions.length})
        </button>
      </div>

      {tab === "deals" && (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Symbol</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Entry</th>
                <th className="px-3 py-2 text-right">Volume</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d) => (
                <tr key={d.id} className="border-t border-zinc-800">
                  <td className="px-3 py-2 text-zinc-400 text-xs">{new Date(d.closedAt).toLocaleString()}</td>
                  <td className="px-3 py-2">{d.symbol || "-"}</td>
                  <td className="px-3 py-2">{d.type}</td>
                  <td className="px-3 py-2">{d.entry}</td>
                  <td className="px-3 py-2 text-right font-mono">{d.volume}</td>
                  <td className="px-3 py-2 text-right font-mono">{d.price}</td>
                  <td className={`px-3 py-2 text-right font-mono ${d.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ${d.profit.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "positions" && (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-3 py-2 text-left">Ticket</th>
                <th className="px-3 py-2 text-left">Symbol</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Volume</th>
                <th className="px-3 py-2 text-right">Open Price</th>
                <th className="px-3 py-2 text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.ticket} className="border-t border-zinc-800">
                  <td className="px-3 py-2 font-mono text-zinc-400">{p.ticket}</td>
                  <td className="px-3 py-2">{p.symbol}</td>
                  <td className="px-3 py-2">{p.type}</td>
                  <td className="px-3 py-2 text-right font-mono">{p.volume}</td>
                  <td className="px-3 py-2 text-right font-mono">{p.openPrice}</td>
                  <td className={`px-3 py-2 text-right font-mono ${p.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ${p.profit.toFixed(2)}
                  </td>
                </tr>
              ))}
              {positions.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-4 text-center text-zinc-500">No open positions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
